import { User } from '@prisma/client';
import { VendorOnboardingService } from '../services/vendor-onboarding.service';
export declare class VendorOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: VendorOnboardingService);
    getOnboardingStatus(user: User): Promise<{
        message: string;
        data: {
            onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
            isOnboarded: boolean;
            completedSteps: number[];
            nextStep: number | null;
        };
    }>;
    updateStep1(user: User, rawBody: Record<string, any>, profilePicture?: Express.Multer.File): Promise<{
        message: string;
        data: {
            onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
            gender: import(".prisma/client").$Enums.Gender | null;
            dob: string | null;
            profilePicture: string | null;
        };
    }>;
    updateStep2(user: User, rawBody: Record<string, any>, files?: {
        storeLogo?: Express.Multer.File[];
        storeCoverImages?: Express.Multer.File[];
    }): Promise<{
        message: string;
        data: {
            onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
            storeName: string | null;
            storeLogo: string | null;
            storeCoverImages: string[];
            storeLocation: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    addShowcaseItems(user: User, rawBody: Record<string, any>, images?: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
            isOnboarded: boolean;
            itemsAdded: number;
            showcase: {
                id: string;
                title: string;
                description: string | null;
                price: number;
                imageUrl: string;
            }[];
        };
    }>;
    deleteShowcaseItem(user: User, itemId: string): Promise<{
        message: string;
        data: {
            deletedItemId: string;
        };
    }>;
}
