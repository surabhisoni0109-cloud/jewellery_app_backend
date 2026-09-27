import { OnboardingStep, UserStatus, UserType } from '@prisma/client';
export declare class UserResponseDto {
    id: string;
    userId: string;
    type: UserType;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
    status: UserStatus;
    isMobileVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    isOnboarded: boolean;
    onboardingStep: OnboardingStep;
}
export declare class OtpResponseDto {
    mobileNumber: string;
    expiresAt?: string;
    devOtp?: string;
}
export declare class AuthSessionResponseDto {
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
export declare class RefreshTokenResponseDto {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}
