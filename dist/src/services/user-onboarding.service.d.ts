import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { UserOnboardingDto } from '../dto/user-onboarding.dto';
import { UserProfile } from '@prisma/client';
export declare class UserOnboardingService {
    private readonly prisma;
    private readonly s3;
    constructor(prisma: PrismaService, s3: S3Service);
    getOrCreateProfile(userId: string): Promise<UserProfile>;
    getOnboarding(userId: string): Promise<{
        isOnboarded: boolean;
        firstName: string;
        lastName: string;
        email: string;
        mobileNumber: string;
        gender: import(".prisma/client").$Enums.Gender | null;
        dob: string | null;
        profilePicture: string | null;
        location: import("@prisma/client/runtime/library").JsonValue;
    }>;
    submitOnboarding(userId: string, dto: UserOnboardingDto, profilePictureFile?: Express.Multer.File): Promise<{
        isOnboarded: boolean;
        firstName: string;
        lastName: string;
        email: string;
        mobileNumber: string;
        gender: import(".prisma/client").$Enums.Gender | null;
        dob: string | null;
        profilePicture: string | null;
        location: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
