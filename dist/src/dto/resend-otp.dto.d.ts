import { UserType } from '@prisma/client';
export declare enum OtpPurpose {
    SIGNUP = "signup",
    SIGNIN = "signin"
}
export declare class ResendOtpDto {
    type: UserType;
    mobileNumber: string;
    purpose?: OtpPurpose;
}
