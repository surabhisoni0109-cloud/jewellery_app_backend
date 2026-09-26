import { JwtService } from '@nestjs/jwt';
import { User, UserType } from '@prisma/client';
import { UsersService } from './users.service';
import { OtpService } from './otp.service';
import { SignupDto } from '../dto/signup.dto';
import { SignupVerifyDto } from '../dto/signup-verify.dto';
import { SigninDto } from '../dto/signin.dto';
import { SigninVerifyDto } from '../dto/signin-verify.dto';
export interface AuthSession {
    userId: string;
    type: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    token: string;
}
export declare class AuthService {
    private readonly usersService;
    private readonly otpService;
    private readonly jwtService;
    constructor(usersService: UsersService, otpService: OtpService, jwtService: JwtService);
    signup(dto: SignupDto): Promise<import("./otp.service").GeneratedOtpResult>;
    verifySignupOtp(dto: SignupVerifyDto): Promise<AuthSession>;
    signin(dto: SigninDto): Promise<import("./otp.service").GeneratedOtpResult>;
    verifySigninOtp(dto: SigninVerifyDto): Promise<AuthSession>;
    createAccountAfterVerification(data: {
        type: UserType;
        firstName: string;
        lastName: string;
        mobileNumber: string;
        email: string;
    }): Promise<User>;
    issueSessionAfterVerification(user: User): Promise<AuthSession>;
}
