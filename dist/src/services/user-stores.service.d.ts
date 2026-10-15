import { PrismaService } from './prisma.service';
import { StoreQueryDto, StoreDetailsDto, StoreJewelleryQueryDto, StoreRatingsQueryDto, CreateStoreRatingDto, CreateStoreEnquiryDto, FavoriteStoresQueryDto } from '../dto/user-stores.dto';
export declare class UserStoresService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveStore(storeId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        gender: import(".prisma/client").$Enums.Gender | null;
        dob: Date | null;
        profilePicture: string | null;
        isOnboarded: boolean;
        onboardingStep: import(".prisma/client").$Enums.OnboardingStep;
        storeName: string | null;
        storeDescription: string | null;
        storeLogo: string | null;
        storeCoverImages: string[];
        storeLocation: import("@prisma/client/runtime/library").JsonValue | null;
        jewelleryStartingPrice: import("@prisma/client/runtime/library").Decimal | null;
        storeWebsite: string | null;
        storeContactNumber: string | null;
        storeOwnerName: string | null;
        whatsappNumber: string | null;
        storeEmail: string | null;
        storeOpeningTime: string | null;
        storeClosingTime: string | null;
        storeFoundedYear: number | null;
    }>;
    getStores(query: StoreQueryDto, userId?: string): Promise<{
        items: {
            id: string;
            userId: string;
            storeName: string;
            storeDescription: string | null;
            storeLogo: string | null;
            storeCoverImage: string | null;
            location: import("@prisma/client/runtime/library").JsonValue;
            distanceKm: number | null;
            averageRating: number;
            totalReviews: number;
            jewelleryStartingPrice: number | null;
            isOpen: boolean;
            isFavorite: boolean;
            storeOpeningTime: string | null;
            storeClosingTime: string | null;
            createdAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStoreDetails(storeId: string, viewerUserId?: string): Promise<StoreDetailsDto>;
    getStoreJewellery(storeId: string, query: StoreJewelleryQueryDto): Promise<{
        items: {
            id: string;
            title: string;
            description: string | null;
            price: number;
            imageUrl: string;
            images: string[];
            jewelleryType: string | null;
            weight: string | null;
            purity: string | null;
            gender: string | null;
            hasDiscount: boolean;
            discountPercentage: number | null;
            discountPrice: number | null;
            hasSpecialOccasion: boolean;
            specialOccasionName: string | null;
            specialOccasionDate: string | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStoreRatings(storeId: string, query: StoreRatingsQueryDto): Promise<{
        summary: {
            averageRating: number;
            totalReviews: number;
            distribution: Record<number, number>;
        };
        reviews: {
            id: string;
            customerId: string | null;
            customerName: string;
            customerProfileImage: string | null;
            rating: number;
            review: string | null;
            createdAt: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createOrUpdateRating(userId: string, storeId: string, dto: CreateStoreRatingDto): Promise<{
        message: string;
        rating: {
            id: string;
            createdAt: Date;
            vendorProfileId: string;
            rating: number;
            customerId: string | null;
            customerName: string;
            customerProfileImage: string | null;
            review: string | null;
        };
    }>;
    createEnquiry(userId: string, storeId: string, dto: CreateStoreEnquiryDto): Promise<{
        enquiryId: string;
        customerName: string;
        message: string;
        jewelleryId: string | null;
        createdAt: Date;
    }>;
    toggleFavorite(userId: string, storeId: string): Promise<{
        isFavorite: boolean;
        message: string;
    }>;
    getFavoriteStores(userId: string, query: FavoriteStoresQueryDto): Promise<{
        items: any;
        pagination: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
