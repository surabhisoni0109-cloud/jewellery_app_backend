import { UserType } from '@prisma/client';
export declare class SignupDto {
    type: UserType;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string;
}
