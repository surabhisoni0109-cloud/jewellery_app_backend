import { Gender } from '@prisma/client';
export declare class VendorOnboardingStep1Dto {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    gender: Gender;
    dob: string;
    profilePicture?: string;
}
