"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JewelleryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JewelleryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const s3_service_1 = require("./s3.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const MAX_JEWELLERY_IMAGES = 5;
let JewelleryService = JewelleryService_1 = class JewelleryService {
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
        this.logger = new common_1.Logger(JewelleryService_1.name);
    }
    async getVendorProfile(userId) {
        const profile = await this.prisma.vendorProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new custom_exception_1.CustomException('Vendor profile not found. Please complete vendor registration.', 'PROFILE_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return profile;
    }
    computeDiscount(price, hasDiscount, discountPercentage, discountPrice) {
        if (!hasDiscount) {
            return {
                hasDiscount: false,
                discountPercentage: null,
                discountPrice: null,
            };
        }
        let finalDiscountPrice = discountPrice ?? null;
        if (discountPercentage !== undefined &&
            discountPercentage !== null &&
            discountPercentage > 0) {
            const calculated = price - (price * Number(discountPercentage)) / 100;
            finalDiscountPrice = Math.max(0, Math.round(calculated * 100) / 100);
        }
        return {
            hasDiscount: true,
            discountPercentage: discountPercentage ?? null,
            discountPrice: finalDiscountPrice,
        };
    }
    formatItem(item) {
        return {
            id: item.id,
            vendorProfileId: item.vendorProfileId,
            name: item.title,
            description: item.description,
            price: Number(item.price),
            imageUrl: item.imageUrl,
            images: item.images && item.images.length > 0 ? item.images : [item.imageUrl],
            jewelleryType: item.jewelleryType,
            weight: item.weight,
            purity: item.purity,
            jewelleryFor: item.gender,
            hasSpecialOccasion: Boolean(item.hasSpecialOccasion),
            specialOccasionName: item.specialOccasionName,
            specialOccasionDate: item.specialOccasionDate,
            hasDiscount: Boolean(item.hasDiscount),
            discountPercentage: item.discountPercentage ? Number(item.discountPercentage) : null,
            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            isPublished: Boolean(item.isPublished),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
    async createJewellery(userId, dto, files) {
        const profile = await this.getVendorProfile(userId);
        if (files && files.length > 0) {
            if (files.length > MAX_JEWELLERY_IMAGES) {
                throw new custom_exception_1.CustomException(`You can upload a maximum of ${MAX_JEWELLERY_IMAGES} images per jewellery item.`, 'TOO_MANY_IMAGES', common_1.HttpStatus.BAD_REQUEST);
            }
            this.s3.validateFiles(files);
        }
        const uploadedUrls = [];
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const ext = file.originalname.split('.').pop() ?? 'jpg';
                const url = await this.s3.uploadFile(file, `vendors/${userId}/jewellery-${Date.now()}-${i + 1}.${ext}`);
                uploadedUrls.push(url);
            }
        }
        const stringUrls = Array.isArray(dto.images)
            ? dto.images
            : typeof dto.images === 'string'
                ? [dto.images]
                : [];
        const combinedImages = [
            ...uploadedUrls,
            ...stringUrls,
        ].filter((url) => typeof url === 'string' && url.trim() !== '');
        if (combinedImages.length === 0) {
            throw new custom_exception_1.CustomException('At least one jewellery image is required.', 'INVALID_IMAGE', common_1.HttpStatus.BAD_REQUEST);
        }
        if (combinedImages.length > MAX_JEWELLERY_IMAGES) {
            throw new custom_exception_1.CustomException(`Total images cannot exceed ${MAX_JEWELLERY_IMAGES}.`, 'TOO_MANY_IMAGES', common_1.HttpStatus.BAD_REQUEST);
        }
        const primaryImageUrl = combinedImages[0];
        const discount = this.computeDiscount(dto.price, dto.hasDiscount, dto.discountPercentage, dto.discountPrice);
        let occasionDate = null;
        if (dto.hasSpecialOccasion && dto.specialOccasionDate) {
            occasionDate = new Date(dto.specialOccasionDate);
        }
        const itemTitle = (dto.name || '').trim();
        if (!itemTitle) {
            throw new custom_exception_1.CustomException('Jewellery name is required.', 'VALIDATION_ERROR', common_1.HttpStatus.BAD_REQUEST);
        }
        const item = await this.prisma.jewelleryShowcase.create({
            data: {
                vendorProfileId: profile.id,
                title: itemTitle,
                description: dto.description?.trim() || null,
                price: dto.price,
                imageUrl: primaryImageUrl,
                images: combinedImages,
                jewelleryType: dto.jewelleryType?.trim() || null,
                weight: dto.weight?.trim() || null,
                purity: dto.purity?.trim() || null,
                gender: dto.jewelleryFor?.trim() || null,
                hasSpecialOccasion: Boolean(dto.hasSpecialOccasion),
                specialOccasionName: dto.hasSpecialOccasion
                    ? dto.specialOccasionName?.trim() || null
                    : null,
                specialOccasionDate: occasionDate,
                hasDiscount: discount.hasDiscount,
                discountPercentage: discount.discountPercentage,
                discountPrice: discount.discountPrice,
                isPublished: dto.isPublished !== undefined ? Boolean(dto.isPublished) : true,
            },
        });
        this.logger.log(`Created jewellery "${item.title}" for vendor ${userId}`);
        return this.formatItem(item);
    }
    async getVendorJewellery(userId, query) {
        const profile = await this.getVendorProfile(userId);
        const { page = 1, limit = 20, search, jewelleryType, jewelleryFor, isPublished, hasDiscount, hasSpecialOccasion, } = query;
        const skip = (page - 1) * limit;
        const where = {
            vendorProfileId: profile.id,
        };
        if (search && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { jewelleryType: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (jewelleryType && jewelleryType.trim() !== '') {
            where.jewelleryType = { equals: jewelleryType.trim(), mode: 'insensitive' };
        }
        if (jewelleryFor && jewelleryFor.trim() !== '') {
            where.gender = { equals: jewelleryFor.trim(), mode: 'insensitive' };
        }
        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }
        if (hasDiscount !== undefined) {
            where.hasDiscount = hasDiscount;
        }
        if (hasSpecialOccasion !== undefined) {
            where.hasSpecialOccasion = hasSpecialOccasion;
        }
        const [items, total] = await Promise.all([
            this.prisma.jewelleryShowcase.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.jewelleryShowcase.count({ where }),
        ]);
        return {
            items: items.map((item) => this.formatItem(item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async getJewelleryById(userId, id) {
        const profile = await this.getVendorProfile(userId);
        const item = await this.prisma.jewelleryShowcase.findFirst({
            where: { id, vendorProfileId: profile.id },
        });
        if (!item) {
            throw new custom_exception_1.CustomException('Jewellery item not found or does not belong to your account', 'SHOWCASE_ITEM_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return this.formatItem(item);
    }
    async updateJewellery(userId, id, dto, newFiles) {
        const profile = await this.getVendorProfile(userId);
        const existing = await this.prisma.jewelleryShowcase.findFirst({
            where: { id, vendorProfileId: profile.id },
        });
        if (!existing) {
            throw new custom_exception_1.CustomException('Jewellery item not found or does not belong to your account', 'SHOWCASE_ITEM_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        let currentImages = existing.images || (existing.imageUrl ? [existing.imageUrl] : []);
        if (dto.existingImages !== undefined) {
            currentImages = dto.existingImages.filter((u) => u && u.trim() !== '');
        }
        const newlyUploadedUrls = [];
        if (newFiles && newFiles.length > 0) {
            if (currentImages.length + newFiles.length > MAX_JEWELLERY_IMAGES) {
                throw new custom_exception_1.CustomException(`Total images cannot exceed ${MAX_JEWELLERY_IMAGES}. You currently have ${currentImages.length} images.`, 'TOO_MANY_IMAGES', common_1.HttpStatus.BAD_REQUEST);
            }
            this.s3.validateFiles(newFiles);
            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const ext = file.originalname.split('.').pop() ?? 'jpg';
                const url = await this.s3.uploadFile(file, `vendors/${userId}/jewellery-${Date.now()}-${i + 1}.${ext}`);
                newlyUploadedUrls.push(url);
            }
        }
        const updatedImages = [...currentImages, ...newlyUploadedUrls];
        const updatedPrimaryImage = updatedImages.length > 0 ? updatedImages[0] : existing.imageUrl;
        const effectivePrice = dto.price !== undefined ? dto.price : Number(existing.price);
        const effectiveHasDiscount = dto.hasDiscount !== undefined ? dto.hasDiscount : existing.hasDiscount;
        const effectiveDiscountPercentage = dto.discountPercentage !== undefined
            ? dto.discountPercentage
            : existing.discountPercentage
                ? Number(existing.discountPercentage)
                : undefined;
        const effectiveDiscountPrice = dto.discountPrice !== undefined
            ? dto.discountPrice
            : existing.discountPrice
                ? Number(existing.discountPrice)
                : undefined;
        const discount = this.computeDiscount(effectivePrice, effectiveHasDiscount, effectiveDiscountPercentage, effectiveDiscountPrice);
        const effectiveHasOccasion = dto.hasSpecialOccasion !== undefined
            ? dto.hasSpecialOccasion
            : existing.hasSpecialOccasion;
        let occasionDate = existing.specialOccasionDate;
        if (dto.specialOccasionDate !== undefined) {
            occasionDate = dto.specialOccasionDate ? new Date(dto.specialOccasionDate) : null;
        }
        const updatedTitle = dto.name?.trim();
        const updatedType = dto.jewelleryType?.trim();
        const updatedJewelleryFor = dto.jewelleryFor?.trim();
        const updated = await this.prisma.jewelleryShowcase.update({
            where: { id },
            data: {
                ...(updatedTitle !== undefined && { title: updatedTitle }),
                ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
                ...(dto.price !== undefined && { price: dto.price }),
                imageUrl: updatedPrimaryImage,
                images: updatedImages,
                ...(updatedType !== undefined && { jewelleryType: updatedType || null }),
                ...(dto.weight !== undefined && { weight: dto.weight?.trim() || null }),
                ...(dto.purity !== undefined && { purity: dto.purity?.trim() || null }),
                ...(updatedJewelleryFor !== undefined && { gender: updatedJewelleryFor || null }),
                hasSpecialOccasion: effectiveHasOccasion,
                specialOccasionName: effectiveHasOccasion
                    ? dto.specialOccasionName !== undefined
                        ? dto.specialOccasionName?.trim() || null
                        : existing.specialOccasionName
                    : null,
                specialOccasionDate: effectiveHasOccasion ? occasionDate : null,
                hasDiscount: discount.hasDiscount,
                discountPercentage: discount.discountPercentage,
                discountPrice: discount.discountPrice,
                ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
                updatedAt: new Date(),
            },
        });
        this.logger.log(`Updated jewellery item ${id} for vendor ${userId}`);
        return this.formatItem(updated);
    }
    async deleteJewellery(userId, id) {
        const profile = await this.getVendorProfile(userId);
        const item = await this.prisma.jewelleryShowcase.findFirst({
            where: { id, vendorProfileId: profile.id },
        });
        if (!item) {
            throw new custom_exception_1.CustomException('Jewellery item not found or does not belong to your account', 'SHOWCASE_ITEM_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const urlsToDelete = new Set();
        if (item.imageUrl)
            urlsToDelete.add(item.imageUrl);
        if (item.images && Array.isArray(item.images)) {
            item.images.forEach((u) => urlsToDelete.add(u));
        }
        for (const url of Array.from(urlsToDelete)) {
            try {
                await this.s3.deleteFileByUrl(url);
            }
            catch (err) {
                this.logger.warn(`Failed to delete S3 file ${url}: ${err.message}`);
            }
        }
        await this.prisma.jewelleryShowcase.delete({
            where: { id },
        });
        this.logger.log(`Deleted jewellery item ${id} by vendor ${userId}`);
        return {
            success: true,
            message: 'Jewellery item deleted successfully',
            deletedId: id,
        };
    }
    async getPublicJewellery(query, vendorProfileId) {
        const { page = 1, limit = 20, search, jewelleryType, jewelleryFor, hasDiscount, hasSpecialOccasion, } = query;
        const skip = (page - 1) * limit;
        const where = {
            isPublished: true,
            ...(vendorProfileId ? { vendorProfileId } : {}),
        };
        if (search && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { jewelleryType: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (jewelleryType && jewelleryType.trim() !== '') {
            where.jewelleryType = { equals: jewelleryType.trim(), mode: 'insensitive' };
        }
        if (jewelleryFor && jewelleryFor.trim() !== '') {
            where.gender = { equals: jewelleryFor.trim(), mode: 'insensitive' };
        }
        if (hasDiscount !== undefined) {
            where.hasDiscount = hasDiscount;
        }
        if (hasSpecialOccasion !== undefined) {
            where.hasSpecialOccasion = hasSpecialOccasion;
        }
        const [items, total] = await Promise.all([
            this.prisma.jewelleryShowcase.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    vendorProfile: {
                        select: {
                            storeName: true,
                            storeLogo: true,
                            storeLocation: true,
                        },
                    },
                },
            }),
            this.prisma.jewelleryShowcase.count({ where }),
        ]);
        return {
            items: items.map((item) => ({
                ...this.formatItem(item),
                storeName: item.vendorProfile?.storeName,
                storeLogo: item.vendorProfile?.storeLogo,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async getPublicJewelleryById(id) {
        const item = await this.prisma.jewelleryShowcase.findFirst({
            where: { id, isPublished: true },
            include: {
                vendorProfile: {
                    select: {
                        id: true,
                        storeName: true,
                        storeLogo: true,
                        storeContactNumber: true,
                        whatsappNumber: true,
                        storeLocation: true,
                    },
                },
            },
        });
        if (!item) {
            throw new custom_exception_1.CustomException('Jewellery item not found', 'SHOWCASE_ITEM_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            ...this.formatItem(item),
            vendor: item.vendorProfile,
        };
    }
};
exports.JewelleryService = JewelleryService;
exports.JewelleryService = JewelleryService = JewelleryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], JewelleryService);
//# sourceMappingURL=jewellery.service.js.map