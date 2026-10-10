import { User } from '@prisma/client';
import { UserOnboardingService } from '../services/user-onboarding.service';
export declare class UserOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: UserOnboardingService);
    getOnboarding(user: User): Promise<{
        message: string;
        data: {
            isOnboarded: boolean;
            firstName: string;
            lastName: string;
            email: string;
            mobileNumber: string;
            gender: import(".prisma/client").$Enums.Gender | null;
            dob: string | null;
            profilePicture: string | null;
            location: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    submitOnboarding(user: User, rawBody: Record<string, any>, profilePicture?: Express.Multer.File): Promise<{
        message: string;
        data: {
            isOnboarded: boolean;
            firstName: string;
            lastName: string;
            email: string;
            mobileNumber: string;
            gender: import(".prisma/client").$Enums.Gender | null;
            dob: string | null;
            profilePicture: string | null;
            location: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    updateOnboarding(user: User, rawBody: Record<string, any>, profilePicture?: Express.Multer.File): Promise<{
        message: string;
        data: {
            isOnboarded: boolean;
            firstName: string;
            lastName: string;
            email: string;
            mobileNumber: string;
            gender: import(".prisma/client").$Enums.Gender | null;
            dob: string | null;
            profilePicture: string | null;
            location: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
}
