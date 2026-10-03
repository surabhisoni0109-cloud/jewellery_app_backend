import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import {
  CreateJewelleryDto,
  UpdateJewelleryDto,
  JewelleryQueryDto,
} from '../dto/jewellery.dto';
import { CustomException } from '../common/exceptions/custom-exception';

const MAX_JEWELLERY_IMAGES = 5;

@Injectable()
export class JewelleryService {
  private readonly logger = new Logger(JewelleryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /**
   * Helper to retrieve vendor profile from userId
   */
  private async getVendorProfile(userId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new CustomException(
        'Vendor profile not found. Please complete vendor registration.',
        'PROFILE_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return profile;
  }

  /**
   * Helper to calculate discounted price
   */
  private computeDiscount(
    price: number,
    hasDiscount?: boolean,
    discountPercentage?: number,
    discountPrice?: number,
  ): {
    hasDiscount: boolean;
    discountPercentage: number | null;
    discountPrice: number | null;
  } {
    if (!hasDiscount) {
      return {
        hasDiscount: false,
        discountPercentage: null,
        discountPrice: null,
      };
    }

    let finalDiscountPrice = discountPrice ?? null;
    if (
      discountPercentage !== undefined &&
      discountPercentage !== null &&
      discountPercentage > 0
    ) {
      const calculated = price - (price * Number(discountPercentage)) / 100;
      finalDiscountPrice = Math.max(0, Math.round(calculated * 100) / 100);
    }

    return {
      hasDiscount: true,
      discountPercentage: discountPercentage ?? null,
      discountPrice: finalDiscountPrice,
    };
  }

  /**
   * Format database item for API output
   */
  private formatItem(item: any) {
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

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CREATE JEWELLERY ITEM (Vendor)
  // ─────────────────────────────────────────────────────────────────────────

  async createJewellery(
    userId: string,
    dto: CreateJewelleryDto,
    files?: Express.Multer.File[],
  ) {
    const profile = await this.getVendorProfile(userId);

    // Validate uploaded images
    if (files && files.length > 0) {
      if (files.length > MAX_JEWELLERY_IMAGES) {
        throw new CustomException(
          `You can upload a maximum of ${MAX_JEWELLERY_IMAGES} images per jewellery item.`,
          'TOO_MANY_IMAGES',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.s3.validateFiles(files);
    }

    // Upload files to S3
    const uploadedUrls: string[] = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.split('.').pop() ?? 'jpg';
        const url = await this.s3.uploadFile(
          file,
          `vendors/${userId}/jewellery-${Date.now()}-${i + 1}.${ext}`,
        );
        uploadedUrls.push(url);
      }
    }

    // Combine with any pre-existing URLs provided in dto.images
    const stringUrls = Array.isArray(dto.images)
      ? dto.images
      : typeof dto.images === 'string'
      ? [dto.images]
      : [];
    const combinedImages: string[] = [
      ...uploadedUrls,
      ...stringUrls,
    ].filter((url) => typeof url === 'string' && url.trim() !== '');

    if (combinedImages.length === 0) {
      throw new CustomException(
        'At least one jewellery image is required.',
        'INVALID_IMAGE',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (combinedImages.length > MAX_JEWELLERY_IMAGES) {
      throw new CustomException(
        `Total images cannot exceed ${MAX_JEWELLERY_IMAGES}.`,
        'TOO_MANY_IMAGES',
        HttpStatus.BAD_REQUEST,
      );
    }

    const primaryImageUrl = combinedImages[0];

    // Compute discount
    const discount = this.computeDiscount(
      dto.price,
      dto.hasDiscount,
      dto.discountPercentage,
      dto.discountPrice,
    );

    // Parse occasion date
    let occasionDate: Date | null = null;
    if (dto.hasSpecialOccasion && dto.specialOccasionDate) {
      occasionDate = new Date(dto.specialOccasionDate);
    }

    const itemTitle = (dto.name || '').trim();
    if (!itemTitle) {
      throw new CustomException(
        'Jewellery name is required.',
        'VALIDATION_ERROR',
        HttpStatus.BAD_REQUEST,
      );
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

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GET ALL JEWELLERY ITEMS (Vendor's Own Inventory)
  // ─────────────────────────────────────────────────────────────────────────

  async getVendorJewellery(userId: string, query: JewelleryQueryDto) {
    const profile = await this.getVendorProfile(userId);
    const {
      page = 1,
      limit = 20,
      search,
      jewelleryType,
      jewelleryFor,
      isPublished,
      hasDiscount,
      hasSpecialOccasion,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {
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

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GET SINGLE JEWELLERY ITEM BY ID (Vendor)
  // ─────────────────────────────────────────────────────────────────────────

  async getJewelleryById(userId: string, id: string) {
    const profile = await this.getVendorProfile(userId);

    const item = await this.prisma.jewelleryShowcase.findFirst({
      where: { id, vendorProfileId: profile.id },
    });

    if (!item) {
      throw new CustomException(
        'Jewellery item not found or does not belong to your account',
        'SHOWCASE_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.formatItem(item);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. UPDATE / EDIT JEWELLERY ITEM (Vendor)
  // ─────────────────────────────────────────────────────────────────────────

  async updateJewellery(
    userId: string,
    id: string,
    dto: UpdateJewelleryDto,
    newFiles?: Express.Multer.File[],
  ) {
    const profile = await this.getVendorProfile(userId);

    const existing = await this.prisma.jewelleryShowcase.findFirst({
      where: { id, vendorProfileId: profile.id },
    });

    if (!existing) {
      throw new CustomException(
        'Jewellery item not found or does not belong to your account',
        'SHOWCASE_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    // Handle images: retain existing or upload new
    let currentImages = existing.images || (existing.imageUrl ? [existing.imageUrl] : []);
    if (dto.existingImages !== undefined) {
      currentImages = dto.existingImages.filter((u) => u && u.trim() !== '');
    }

    // Upload any newly provided files
    const newlyUploadedUrls: string[] = [];
    if (newFiles && newFiles.length > 0) {
      if (currentImages.length + newFiles.length > MAX_JEWELLERY_IMAGES) {
        throw new CustomException(
          `Total images cannot exceed ${MAX_JEWELLERY_IMAGES}. You currently have ${currentImages.length} images.`,
          'TOO_MANY_IMAGES',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.s3.validateFiles(newFiles);

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const ext = file.originalname.split('.').pop() ?? 'jpg';
        const url = await this.s3.uploadFile(
          file,
          `vendors/${userId}/jewellery-${Date.now()}-${i + 1}.${ext}`,
        );
        newlyUploadedUrls.push(url);
      }
    }

    const updatedImages = [...currentImages, ...newlyUploadedUrls];
    const updatedPrimaryImage =
      updatedImages.length > 0 ? updatedImages[0] : existing.imageUrl;

    // Price & Discount calculation
    const effectivePrice = dto.price !== undefined ? dto.price : Number(existing.price);
    const effectiveHasDiscount =
      dto.hasDiscount !== undefined ? dto.hasDiscount : existing.hasDiscount;
    const effectiveDiscountPercentage =
      dto.discountPercentage !== undefined
        ? dto.discountPercentage
        : existing.discountPercentage
        ? Number(existing.discountPercentage)
        : undefined;
    const effectiveDiscountPrice =
      dto.discountPrice !== undefined
        ? dto.discountPrice
        : existing.discountPrice
        ? Number(existing.discountPrice)
        : undefined;

    const discount = this.computeDiscount(
      effectivePrice,
      effectiveHasDiscount,
      effectiveDiscountPercentage,
      effectiveDiscountPrice,
    );

    // Special occasion parsing
    const effectiveHasOccasion =
      dto.hasSpecialOccasion !== undefined
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

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DELETE JEWELLERY ITEM (Vendor)
  // ─────────────────────────────────────────────────────────────────────────

  async deleteJewellery(userId: string, id: string) {
    const profile = await this.getVendorProfile(userId);

    const item = await this.prisma.jewelleryShowcase.findFirst({
      where: { id, vendorProfileId: profile.id },
    });

    if (!item) {
      throw new CustomException(
        'Jewellery item not found or does not belong to your account',
        'SHOWCASE_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    // Collect all image URLs to delete from S3
    const urlsToDelete = new Set<string>();
    if (item.imageUrl) urlsToDelete.add(item.imageUrl);
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach((u) => urlsToDelete.add(u));
    }

    for (const url of Array.from(urlsToDelete)) {
      try {
        await this.s3.deleteFileByUrl(url);
      } catch (err: any) {
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

  // ─────────────────────────────────────────────────────────────────────────
  // 6. PUBLIC / MARKETPLACE ENDPOINTS (For Mobile App Buyers)
  // ─────────────────────────────────────────────────────────────────────────

  async getPublicJewellery(query: JewelleryQueryDto, vendorProfileId?: string) {
    const {
      page = 1,
      limit = 20,
      search,
      jewelleryType,
      jewelleryFor,
      hasDiscount,
      hasSpecialOccasion,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {
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

  async getPublicJewelleryById(id: string) {
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
      throw new CustomException(
        'Jewellery item not found',
        'SHOWCASE_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      ...this.formatItem(item),
      vendor: item.vendorProfile,
    };
  }
}
