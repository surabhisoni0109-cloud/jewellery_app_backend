import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserType } from '@prisma/client';
import { UsersService } from './users.service';
import { OtpService } from './otp.service';
import { SignupDto } from '../dto/signup.dto';
import { SignupVerifyDto } from '../dto/signup-verify.dto';
import { SigninDto } from '../dto/signin.dto';
import { SigninVerifyDto } from '../dto/signin-verify.dto';
import { CustomException } from '../common/exceptions/custom-exception';

export interface AuthSession {
  userId: string;
  type: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

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
   * Replaceable / Decoupled JWT Session Issuance Method.
   * Issues JWT session payload matching exact spec: { userId, type, firstName, lastName, mobileNumber, email, token }.
   */
  async issueSessionAfterVerification(user: User): Promise<AuthSession> {
    const payload = {
      sub: user.userId,
      type: user.type,
      mobileNumber: user.mobileNumber,
    };

    const token = this.jwtService.sign(payload);

    return {
      userId: user.userId,
      type: user.type.toLowerCase(),
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      email: user.email,
      token,
    };
  }
}
