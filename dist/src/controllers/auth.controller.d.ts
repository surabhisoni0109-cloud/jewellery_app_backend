import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { SignupVerifyDto } from '../dto/signup-verify.dto';
import { SigninDto } from '../dto/signin.dto';
import { SigninVerifyDto } from '../dto/signin-verify.dto';
import { User } from '@prisma/client';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        data: import("../services/otp.service").GeneratedOtpResult;
    }>;
    verifySignupOtp(signupVerifyDto: SignupVerifyDto): Promise<{
        message: string;
        data: import("../services/auth.service").AuthSession;
    }>;
    signin(signinDto: SigninDto): Promise<{
        message: string;
        data: import("../services/otp.service").GeneratedOtpResult;
    }>;
    verifySigninOtp(signinVerifyDto: SigninVerifyDto): Promise<{
        message: string;
        data: import("../services/auth.service").AuthSession;
    }>;
    getMe(user: User): Promise<{
        message: string;
        data: {
            id: string;
            userId: string;
            type: import(".prisma/client").$Enums.UserType;
            firstName: string;
            lastName: string;
            mobileNumber: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
            isMobileVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
