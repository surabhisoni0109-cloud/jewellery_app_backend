import { User } from '@prisma/client';
import { UserStoresService } from '../services/user-stores.service';
import { StoreQueryDto, StoreDetailsDto, StoreJewelleryQueryDto, StoreRatingsQueryDto, CreateStoreRatingDto, CreateStoreEnquiryDto } from '../dto/user-stores.dto';
export declare class UserStoresController {
    private readonly userStoresService;
    constructor(userStoresService: UserStoresService);
    getStores(query: StoreQueryDto, user?: User): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getStoreDetails(storeId: string, user?: User): Promise<{
        message: string;
        data: StoreDetailsDto;
    }>;
    getStoreJewellery(storeId: string, query: StoreJewelleryQueryDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    getStoreRatings(storeId: string, query: StoreRatingsQueryDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
    createOrUpdateRating(user: User, storeId: string, dto: CreateStoreRatingDto): Promise<{
        message: string;
        data: {
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
    createEnquiry(user: User, storeId: string, dto: CreateStoreEnquiryDto): Promise<{
        message: string;
        data: {
            enquiryId: string;
            customerName: string;
            message: string;
            jewelleryId: string | null;
            createdAt: Date;
        };
    }>;
}
