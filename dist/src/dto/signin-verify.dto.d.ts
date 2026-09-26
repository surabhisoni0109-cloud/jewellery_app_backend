import { UserType } from '@prisma/client';
export declare class SigninVerifyDto {
    type: UserType;
    mobileNumber: string;
    otp: string;
}
