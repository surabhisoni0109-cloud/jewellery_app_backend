import { OnboardingStep, Gender } from '@prisma/client';
export declare class Step1ResponseDto {
    onboardingStep: OnboardingStep;
    gender: Gender;
    dob: string;
    profilePicture: string | null;
}
export declare class Step2ResponseDto {
    onboardingStep: OnboardingStep;
    storeName: string;
    storeLogo: string | null;
    storeCoverImages: string[];
    storeLocation: object;
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
    itemsAdded: number;
    showcase: ShowcaseItemResponseDto[];
}
export declare class OnboardingStatusResponseDto {
    onboardingStep: OnboardingStep;
    isOnboarded: boolean;
    completedSteps: number[];
    nextStep: number | null;
}
