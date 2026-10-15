export declare enum StoreSortBy {
    DISTANCE = "distance",
    RATING = "rating",
    PRICE = "price",
    NEWEST = "newest"
}
export declare class StoreQueryDto {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    pincode?: string;
    search?: string;
    sortBy?: StoreSortBy;
    page?: number;
    limit?: number;
}
export declare class StoreListItemDto {
    id: string;
    userId: string;
    storeName: string;
    storeDescription: string | null;
    storeLogo: string | null;
    storeCoverImage: string | null;
    location: object | null;
    distanceKm: number | null;
    averageRating: number;
    totalReviews: number;
    jewelleryStartingPrice: number | null;
    isOpen: boolean;
    isFavorite: boolean;
    storeOpeningTime: string | null;
    storeClosingTime: string | null;
}
export declare class RatingSummaryDto {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
}
export declare class StoreDetailsDto {
    id: string;
    userId: string;
    storeName: string;
    storeDescription: string | null;
    storeLogo: string | null;
    storeCoverImages: string[];
    location: object | null;
    distanceKm: number | null;
    jewelleryStartingPrice: number | null;
    storeWebsite: string | null;
    storeContactNumber: string | null;
    storeOwnerName: string | null;
    whatsappNumber: string | null;
    storeEmail: string | null;
    storeOpeningTime: string | null;
    storeClosingTime: string | null;
    storeFoundedYear: number | null;
    isOpen: boolean;
    isFavorite: boolean;
    ratingSummary: RatingSummaryDto;
}
export declare class StoreJewelleryQueryDto {
    jewelleryType?: string;
    gender?: string;
    hasDiscount?: boolean;
    hasSpecialOccasion?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class StoreJewelleryItemDto {
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
}
export declare class StoreRatingsQueryDto {
    rating?: number;
    page?: number;
    limit?: number;
}
export declare class StoreReviewItemDto {
    id: string;
    customerId: string | null;
    customerName: string;
    customerProfileImage: string | null;
    rating: number;
    review: string | null;
    createdAt: string;
}
export declare class CreateStoreRatingDto {
    rating: number;
    review?: string;
}
export declare class CreateStoreEnquiryDto {
    message: string;
    jewelleryId?: string;
}
export declare class ToggleFavoriteResponseDto {
    isFavorite: boolean;
    message: string;
}
export declare class FavoriteStoresQueryDto {
    latitude?: number;
    longitude?: number;
    page?: number;
    limit?: number;
}
