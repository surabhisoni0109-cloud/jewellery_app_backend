export declare class CreateJewelleryDto {
    name: string;
    description?: string;
    price: number;
    jewelleryType?: string;
    weight?: string;
    purity?: string;
    jewelleryFor?: string;
    hasSpecialOccasion?: boolean;
    specialOccasionName?: string;
    specialOccasionDate?: string | Date;
    hasDiscount?: boolean;
    discountPercentage?: number;
    discountPrice?: number;
    isPublished?: boolean;
    images?: any;
}
export declare class UpdateJewelleryDto {
    name?: string;
    description?: string;
    price?: number;
    jewelleryType?: string;
    weight?: string;
    purity?: string;
    jewelleryFor?: string;
    hasSpecialOccasion?: boolean;
    specialOccasionName?: string;
    specialOccasionDate?: string | Date;
    hasDiscount?: boolean;
    discountPercentage?: number;
    discountPrice?: number;
    isPublished?: boolean;
    images?: any;
    existingImages?: string[];
}
export declare class JewelleryQueryDto {
    page: number;
    limit: number;
    search?: string;
    jewelleryType?: string;
    jewelleryFor?: string;
    isPublished?: boolean;
    hasDiscount?: boolean;
    hasSpecialOccasion?: boolean;
}
export declare class JewelleryResponseDto {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl: string;
    images: string[];
    jewelleryType?: string | null;
    weight?: string | null;
    purity?: string | null;
    jewelleryFor?: string | null;
    hasSpecialOccasion: boolean;
    specialOccasionName?: string | null;
    specialOccasionDate?: Date | null;
    hasDiscount: boolean;
    discountPercentage?: number | null;
    discountPrice?: number | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
