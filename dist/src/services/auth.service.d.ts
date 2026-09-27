import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OnboardingStep, User, UserType } from '@prisma/client';
import { UsersService } from './users.service';
import { OtpService } from './otp.service';
import { RedisService } from './redis.service';
import { PrismaService } from './prisma.service';
import { SignupDto } from '../dto/signup.dto';
import { SignupVerifyDto } from '../dto/signup-verify.dto';
import { SigninDto } from '../dto/signin.dto';
import { SigninVerifyDto } from '../dto/signin-verify.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
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
export declare class AuthService {
    private readonly usersService;
    private readonly otpService;
    private readonly jwtService;
    private readonly redisService?;
    private readonly configService?;
    private readonly prisma?;
    constructor(usersService: UsersService, otpService: OtpService, jwtService: JwtService, redisService?: RedisService | undefined, configService?: ConfigService | undefined, prisma?: PrismaService | undefined);
    private get jwtSecret();
    private get refreshSecret();
    private get accessExpiresIn();
    private get refreshExpiresIn();
    private parseDurationToSeconds;
    signup(dto: SignupDto): Promise<import("./otp.service").GeneratedOtpResult>;
    verifySignupOtp(dto: SignupVerifyDto): Promise<AuthSession>;
    signin(dto: SigninDto): Promise<import("./otp.service").GeneratedOtpResult>;
    verifySigninOtp(dto: SigninVerifyDto): Promise<AuthSession>;
    resendOtp(dto: ResendOtpDto): Promise<import("./otp.service").GeneratedOtpResult>;
    createAccountAfterVerification(data: {
        type: UserType;
        firstName: string;
        lastName: string;
        mobileNumber: string;
        email: string;
    }): Promise<User>;
    getOnboardingStatus(user: User): Promise<{
        isOnboarded: boolean;
        onboardingStep: OnboardingStep;
    }>;
    getUserProfile(user: User): Promise<User & {
        isOnboarded: boolean;
        onboardingStep: OnboardingStep;
    }>;
    issueSessionAfterVerification(user: User): Promise<AuthSession>;
    refreshToken(dto: RefreshTokenDto): Promise<RefreshedTokens>;
}
