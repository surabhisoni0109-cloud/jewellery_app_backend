import { Gender } from '@prisma/client';
export declare class UserLocationDto {
    latitude?: number;
    longitude?: number;
    addressLine1: string;
    addressLine2?: string;
    area: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}
export declare class UserOnboardingDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    gender: Gender;
    dob: string;
    location: UserLocationDto;
    profilePicture?: string;
}
export declare class UserOnboardingResponseDto {
    isOnboarded: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    gender: Gender | null;
    dob: string | null;
    profilePicture: string | null;
    location: object | null;
}
