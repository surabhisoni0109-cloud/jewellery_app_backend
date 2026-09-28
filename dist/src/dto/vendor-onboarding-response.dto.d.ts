import { OnboardingStep, Gender } from '@prisma/client';
export declare class Step1ResponseDto {
    onboardingStep: OnboardingStep;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    gender: Gender | null;
    dob: string | null;
    profilePicture: string | null;
}
export declare class Step2ResponseDto {
    onboardingStep: OnboardingStep;
    isOnboarded: boolean;
    storeName: string;
    storeDescription: string | null;
    storeLogo: string | null;
    storeCoverImages: string[];
    storeLocation: object;
    jewelleryStartingPrice: number | null;
    storeWebsite: string | null;
    storeContactNumber: string | null;
    storeOwnerName: string | null;
    whatsappNumber: string | null;
    storeEmail: string | null;
    storeOpeningTime: string | null;
    storeClosingTime: string | null;
    storeFoundedYear: number | null;
}
export declare class ShowcaseItemResponseDto {
    id: string;
    title: string;
    description: string | null;
    price: number;
    imageUrl: string;
}
export declare class Step3ResponseDto {
    onboardingStep: OnboardingStep;
    isOnboarded: boolean;
    itemsAdded?: number;
    totalItems?: number;
    showcase: ShowcaseItemResponseDto[];
}
export declare class OnboardingPrefillDto {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
}
export declare class OnboardingStatusResponseDto {
    onboardingStep: OnboardingStep;
    isOnboarded: boolean;
    completedSteps: number[];
    nextStep: number | null;
    prefill: OnboardingPrefillDto;
}
