import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { VendorOnboardingStep1Dto } from '../dto/vendor-onboarding-step1.dto';
import { VendorOnboardingStep2Dto } from '../dto/vendor-onboarding-step2.dto';
import { VendorOnboardingStep3Dto } from '../dto/vendor-onboarding-step3.dto';
export declare class VendorOnboardingService {
    private readonly prisma;
    private readonly s3;
    constructor(prisma: PrismaService, s3: S3Service);
    private getOrCreateProfile;
    private resolveCompletedSteps;
    private resolveNextStep;
    private resolveNewOnboardingStep;
    updateStep1(userId: string, dto: VendorOnboardingStep1Dto, profilePictureFile?: Express.Multer.File): Promise<{
        onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
        gender: import(".prisma/client").$Enums.Gender | null;
        dob: string | null;
        profilePicture: string | null;
    }>;
    updateStep2(userId: string, dto: VendorOnboardingStep2Dto, storeLogoFile?: Express.Multer.File, storeCoverFiles?: Express.Multer.File[]): Promise<{
        onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
        storeName: string | null;
        storeLogo: string | null;
        storeCoverImages: string[];
        storeLocation: import("@prisma/client/runtime/library").JsonValue;
    }>;
    addShowcaseItems(userId: string, dto: VendorOnboardingStep3Dto, itemImages: Express.Multer.File[]): Promise<{
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
    }>;
    deleteShowcaseItem(userId: string, itemId: string): Promise<{
        deletedItemId: string;
    }>;
    getOnboardingStatus(userId: string): Promise<{
        onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
        isOnboarded: boolean;
        completedSteps: number[];
        nextStep: number | null;
    }>;
}
