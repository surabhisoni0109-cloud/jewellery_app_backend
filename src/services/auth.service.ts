import { Injectable, HttpStatus, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnboardingStep, User, UserType } from '@prisma/client';
import * as crypto from 'crypto';
import { UsersService } from './users.service';
import { OtpService } from './otp.service';
import { RedisService } from './redis.service';
import { PrismaService } from './prisma.service';
import { SignupDto } from '../dto/signup.dto';
import { SignupVerifyDto } from '../dto/signup-verify.dto';
import { SigninDto } from '../dto/signin.dto';
import { SigninVerifyDto } from '../dto/signin-verify.dto';
import { ResendOtpDto, OtpPurpose } from '../dto/resend-otp.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { CustomException } from '../common/exceptions/custom-exception';

export interface AuthSession {
  userId: string;
  type: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  token: string;
  refreshToken?: string;
  isOnboarded: boolean;
  onboardingStep: OnboardingStep;
}

export interface RefreshedTokens {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    @Optional() private readonly redisService?: RedisService,
    @Optional() private readonly configService?: ConfigService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  private get jwtSecret(): string {
    return this.configService?.get<string>('JWT_SECRET') || 'default_jwt_secret_min_32_chars';
  }

  private get refreshSecret(): string {
    const customRefreshSecret = this.configService?.get<string>('JWT_REFRESH_SECRET');
    if (customRefreshSecret && customRefreshSecret.trim().length > 0) {
      return customRefreshSecret.trim();
    }
    return `${this.jwtSecret}_refresh`;
  }

  private get accessExpiresIn(): string {
    return (
      this.configService?.get<string>('JWT_ACCESS_EXPIRES_IN') ||
      this.configService?.get<string>('JWT_EXPIRES_IN') ||
      '1d'
    );
  }

  private get refreshExpiresIn(): string {
    return this.configService?.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
  }

  private parseDurationToSeconds(durationStr: string, defaultSeconds: number): number {
    if (!durationStr) return defaultSeconds;
    const match = durationStr.toString().trim().match(/^(\d+)([smhd])?$/i);
    if (!match) return defaultSeconds;
    const value = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase();
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return defaultSeconds;
    }
  }

  /**
   * Step 1 Signup: Validate payload, check DB for duplicates, store pending signup in Redis & dispatch OTP.
   */
  async signup(dto: SignupDto) {
    const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
    const normalizedEmail = this.usersService.normalizeEmail(dto.email);

    // 1. Check duplicate mobile + type
    const existingMobile = await this.usersService.findByMobileAndType(trimmedMobile, dto.type);
    if (existingMobile) {
      throw new CustomException(
        'An account with this mobile number already exists for the specified type',
        'MOBILE_ALREADY_EXISTS',
        HttpStatus.CONFLICT,
      );
    }

    // 2. Check duplicate email + type
    const existingEmail = await this.usersService.findByEmailAndType(normalizedEmail, dto.type);
    if (existingEmail) {
      throw new CustomException(
        'An account with this email address already exists for the specified type',
        'EMAIL_ALREADY_EXISTS',
        HttpStatus.CONFLICT,
      );
    }

    // 3. Dispatch OTP and store payload in Redis
    const cleanPayload: SignupDto = {
      type: dto.type,
      firstName: this.usersService.trimInput(dto.firstName),
      lastName: this.usersService.trimInput(dto.lastName),
      mobileNumber: trimmedMobile,
      email: normalizedEmail,
    };

    return this.otpService.sendSignupOtp(trimmedMobile, cleanPayload);
  }

  /**
   * Step 2 Signup Verification: Verify OTP, create account & issue session token.
   */
  async verifySignupOtp(dto: SignupVerifyDto): Promise<AuthSession> {
    const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
    const purposeKey = `signup:${trimmedMobile}`;

    // Verify OTP and fetch stored registration payload
    const storedData = await this.otpService.verifyOtpAndRetrieveData<{ payload: SignupDto }>(
      purposeKey,
      dto.otp,
    );

    const payload = storedData.payload;

    // Create Account (Decoupled method)
    const user = await this.createAccountAfterVerification({
      type: payload.type,
      firstName: payload.firstName,
      lastName: payload.lastName,
      mobileNumber: payload.mobileNumber,
      email: payload.email,
    });

    // Issue Session Token (Decoupled method)
    return this.issueSessionAfterVerification(user);
  }

  /**
   * Step 1 Signin: Check user existence & status, dispatch OTP.
   */
  async signin(dto: SigninDto) {
    const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);

    const user = await this.usersService.findByMobileAndType(trimmedMobile, dto.type);

    if (!user) {
      throw new CustomException(
        `No registered ${dto.type.toLowerCase()} account found with mobile number ${trimmedMobile}`,
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === 'BLOCKED') {
      throw new CustomException(
        'Account has been blocked. Please contact support.',
        'ACCOUNT_BLOCKED',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.otpService.sendSigninOtp(dto.type, trimmedMobile, user.userId);
  }

  /**
   * Step 2 Signin Verification: Verify OTP, verify account status & issue session token.
   */
  async verifySigninOtp(dto: SigninVerifyDto): Promise<AuthSession> {
    const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
    const purposeKey = `signin:${dto.type}:${trimmedMobile}`;

    // Verify OTP and fetch stored signin data
    const storedData = await this.otpService.verifyOtpAndRetrieveData<{ userId: string }>(
      purposeKey,
      dto.otp,
    );

    const user = await this.usersService.findByUserId(storedData.userId);

    if (!user) {
      throw new CustomException(
        'User account no longer exists',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === 'BLOCKED') {
      throw new CustomException(
        'Account has been blocked. Please contact support.',
        'ACCOUNT_BLOCKED',
        HttpStatus.FORBIDDEN,
      );
    }

    // Issue Session Token (Decoupled method)
    return this.issueSessionAfterVerification(user);
  }

  /**
   * Resend OTP for signup or signin.
   */
  async resendOtp(dto: ResendOtpDto) {
    const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);

    if (dto.purpose === OtpPurpose.SIGNUP) {
      return this.otpService.resendSignupOtp(trimmedMobile);
    }

    if (dto.purpose === OtpPurpose.SIGNIN) {
      const user = await this.usersService.findByMobileAndType(trimmedMobile, dto.type);
      if (!user) {
        throw new CustomException(
          `No registered ${dto.type.toLowerCase()} account found with mobile number ${trimmedMobile}`,
          'USER_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.status === 'BLOCKED') {
        throw new CustomException(
          'Account has been blocked. Please contact support.',
          'ACCOUNT_BLOCKED',
          HttpStatus.FORBIDDEN,
        );
      }

      return this.otpService.sendSigninOtp(dto.type, trimmedMobile, user.userId);
    }

    // Default: Check if pending signup exists first
    const hasPendingSignup = await this.otpService.hasPendingSignup(trimmedMobile);
    if (hasPendingSignup) {
      return this.otpService.resendSignupOtp(trimmedMobile);
    }

    const user = await this.usersService.findByMobileAndType(trimmedMobile, dto.type);
    if (!user) {
      throw new CustomException(
        `No registered account or pending signup found with mobile number ${trimmedMobile}`,
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.status === 'BLOCKED') {
      throw new CustomException(
        'Account has been blocked. Please contact support.',
        'ACCOUNT_BLOCKED',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.otpService.sendSigninOtp(dto.type, trimmedMobile, user.userId);
  }

  /**
   * Replaceable / Decoupled Account Creation Method.
   * Can be called after phone verification by any provider (OTP, Firebase, OAuth).
   */
  async createAccountAfterVerification(data: {
    type: UserType;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
  }): Promise<User> {
    return this.usersService.createUser(data);
  }

  /**
   * Resolves the onboarding state for a user or vendor.
   * Regular buyers are always considered onboarded. Vendors reflect their database progress.
   */
  async getOnboardingStatus(user: User): Promise<{ isOnboarded: boolean; onboardingStep: OnboardingStep }> {
    if (user.type === UserType.USER) {
      return {
        isOnboarded: true,
        onboardingStep: OnboardingStep.COMPLETED,
      };
    }

    if (this.prisma) {
      const vendorProfile = await this.prisma.vendorProfile.findUnique({
        where: { userId: user.userId },
        select: { isOnboarded: true, onboardingStep: true },
      });

      if (vendorProfile) {
        return {
          isOnboarded: vendorProfile.isOnboarded,
          onboardingStep: vendorProfile.onboardingStep,
        };
      }
    }

    return {
      isOnboarded: false,
      onboardingStep: OnboardingStep.PENDING,
    };
  }

  /**
   * Returns complete user profile including resolved onboarding state.
   */
  async getUserProfile(user: User): Promise<User & { isOnboarded: boolean; onboardingStep: OnboardingStep }> {
    const onboarding = await this.getOnboardingStatus(user);
    return {
      ...user,
      isOnboarded: onboarding.isOnboarded,
      onboardingStep: onboarding.onboardingStep,
    };
  }

  /**
   * Replaceable / Decoupled JWT Session Issuance Method.
   * Issues JWT session payload matching exact spec: { userId, type, firstName, lastName, mobileNumber, email, token, refreshToken, isOnboarded, onboardingStep }.
   */
  async issueSessionAfterVerification(user: User): Promise<AuthSession> {
    const payload = {
      sub: user.userId,
      type: user.type,
      mobileNumber: user.mobileNumber,
    };

    const token = this.jwtService.sign(payload);

    const jti = crypto.randomUUID();
    const refreshPayload = {
      sub: user.userId,
      jti,
      tokenType: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    const refreshTtlSeconds = this.parseDurationToSeconds(this.refreshExpiresIn, 7 * 86400);
    if (this.redisService) {
      await this.redisService.set(`refresh_token:${user.userId}:${jti}`, '1', refreshTtlSeconds);
    }

    const onboarding = await this.getOnboardingStatus(user);

    return {
      userId: user.userId,
      type: user.type.toLowerCase(),
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      email: user.email,
      token,
      refreshToken,
      isOnboarded: onboarding.isOnboarded,
      onboardingStep: onboarding.onboardingStep,
    };
  }

  /**
   * Validates refresh token, checks revocation in Redis, verifies user status, and rotates tokens.
   */
  async refreshToken(dto: RefreshTokenDto): Promise<RefreshedTokens> {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.refreshToken, {
        secret: this.refreshSecret,
      });
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw new CustomException(
          'Refresh token has expired. Please sign in again.',
          'REFRESH_TOKEN_EXPIRED',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new CustomException(
        'Invalid refresh token. Please sign in again.',
        'INVALID_REFRESH_TOKEN',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!decoded || decoded.tokenType !== 'refresh' || !decoded.sub || !decoded.jti) {
      throw new CustomException(
        'Invalid refresh token payload.',
        'INVALID_REFRESH_TOKEN',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = decoded.sub;
    const jti = decoded.jti;

    if (this.redisService) {
      const stored = await this.redisService.get(`refresh_token:${userId}:${jti}`);
      if (!stored) {
        throw new CustomException(
          'Refresh token has been revoked or already used.',
          'INVALID_REFRESH_TOKEN',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    const user = await this.usersService.findByUserId(userId);
    if (!user) {
      throw new CustomException(
        'User account associated with this token does not exist.',
        'USER_NOT_FOUND',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status === 'BLOCKED') {
      throw new CustomException(
        'Account has been blocked. Please contact support.',
        'ACCOUNT_BLOCKED',
        HttpStatus.FORBIDDEN,
      );
    }

    if (this.redisService) {
      await this.redisService.del(`refresh_token:${userId}:${jti}`);
    }

    const accessPayload = {
      sub: user.userId,
      type: user.type,
      mobileNumber: user.mobileNumber,
    };
    const newAccessToken = this.jwtService.sign(accessPayload);

    const newJti = crypto.randomUUID();
    const newRefreshPayload = {
      sub: user.userId,
      jti: newJti,
      tokenType: 'refresh',
    };
    const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    const refreshTtlSeconds = this.parseDurationToSeconds(this.refreshExpiresIn, 7 * 86400);
    if (this.redisService) {
      await this.redisService.set(`refresh_token:${userId}:${newJti}`, '1', refreshTtlSeconds);
    }

    const accessExpiresInSeconds = this.parseDurationToSeconds(this.accessExpiresIn, 86400);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresInSeconds,
    };
  }
}
