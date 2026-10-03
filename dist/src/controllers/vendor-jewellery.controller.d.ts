import { User } from '@prisma/client';
import { JewelleryService } from '../services/jewellery.service';
import { CreateJewelleryDto, UpdateJewelleryDto, JewelleryQueryDto } from '../dto/jewellery.dto';
export declare class VendorJewelleryController {
    private readonly jewelleryService;
    constructor(jewelleryService: JewelleryService);
    createJewellery(user: User, dto: CreateJewelleryDto, files?: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            id: any;
            vendorProfileId: any;
            name: any;
            description: any;
            price: number;
            imageUrl: any;
            images: any;
            jewelleryType: any;
            weight: any;
            purity: any;
            jewelleryFor: any;
            hasSpecialOccasion: boolean;
            specialOccasionName: any;
            specialOccasionDate: any;
            hasDiscount: boolean;
            discountPercentage: number | null;
            discountPrice: number | null;
            isPublished: boolean;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    getVendorJewellery(user: User, query: JewelleryQueryDto): Promise<{
        message: string;
        data: {
            items: {
                id: any;
                vendorProfileId: any;
                name: any;
                description: any;
                price: number;
                imageUrl: any;
                images: any;
                jewelleryType: any;
                weight: any;
                purity: any;
                jewelleryFor: any;
                hasSpecialOccasion: boolean;
                specialOccasionName: any;
                specialOccasionDate: any;
                hasDiscount: boolean;
                discountPercentage: number | null;
                discountPrice: number | null;
                isPublished: boolean;
                createdAt: any;
                updatedAt: any;
            }[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getJewelleryById(user: User, id: string): Promise<{
        message: string;
        data: {
            id: any;
            vendorProfileId: any;
            name: any;
            description: any;
            price: number;
            imageUrl: any;
            images: any;
            jewelleryType: any;
            weight: any;
            purity: any;
            jewelleryFor: any;
            hasSpecialOccasion: boolean;
            specialOccasionName: any;
            specialOccasionDate: any;
            hasDiscount: boolean;
            discountPercentage: number | null;
            discountPrice: number | null;
            isPublished: boolean;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    updateJewellery(user: User, id: string, dto: UpdateJewelleryDto, files?: Express.Multer.File[]): Promise<{
        message: string;
        data: {
            id: any;
            vendorProfileId: any;
            name: any;
            description: any;
            price: number;
            imageUrl: any;
            images: any;
            jewelleryType: any;
            weight: any;
            purity: any;
            jewelleryFor: any;
            hasSpecialOccasion: boolean;
            specialOccasionName: any;
            specialOccasionDate: any;
            hasDiscount: boolean;
            discountPercentage: number | null;
            discountPrice: number | null;
            isPublished: boolean;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    deleteJewellery(user: User, id: string): Promise<{
        success: boolean;
        message: string;
        deletedId: string;
    }>;
    getPublicJewellery(query: JewelleryQueryDto, vendorProfileId?: string): Promise<{
        message: string;
        data: {
            items: {
                storeName: string | null;
                storeLogo: string | null;
                id: any;
                vendorProfileId: any;
                name: any;
                description: any;
                price: number;
                imageUrl: any;
                images: any;
                jewelleryType: any;
                weight: any;
                purity: any;
                jewelleryFor: any;
                hasSpecialOccasion: boolean;
                specialOccasionName: any;
                specialOccasionDate: any;
                hasDiscount: boolean;
                discountPercentage: number | null;
                discountPrice: number | null;
                isPublished: boolean;
                createdAt: any;
                updatedAt: any;
            }[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPublicJewelleryById(id: string): Promise<{
        message: string;
        data: {
            vendor: {
                id: string;
                storeName: string | null;
                storeLogo: string | null;
                storeLocation: import("@prisma/client/runtime/library").JsonValue;
                storeContactNumber: string | null;
                whatsappNumber: string | null;
            };
            id: any;
            vendorProfileId: any;
            name: any;
            description: any;
            price: number;
            imageUrl: any;
            images: any;
            jewelleryType: any;
            weight: any;
            purity: any;
            jewelleryFor: any;
            hasSpecialOccasion: boolean;
            specialOccasionName: any;
            specialOccasionDate: any;
            hasDiscount: boolean;
            discountPercentage: number | null;
            discountPrice: number | null;
            isPublished: boolean;
            createdAt: any;
            updatedAt: any;
        };
    }>;
}
