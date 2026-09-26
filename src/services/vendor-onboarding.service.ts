import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { CustomException } from '../common/exceptions/custom-exception';
import { VendorOnboardingStep1Dto } from '../dto/vendor-onboarding-step1.dto';
import { VendorOnboardingStep2Dto } from '../dto/vendor-onboarding-step2.dto';
import { VendorOnboardingStep3Dto } from '../dto/vendor-onboarding-step3.dto';
import { OnboardingStep, VendorProfile } from '@prisma/client';

const MAX_SHOWCASE_ITEMS = 5;
const MAX_COVER_IMAGES = 5;

@Injectable()
export class VendorOnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetches or creates the VendorProfile for a given userId.
   */
  private async getOrCreateProfile(userId: string): Promise<VendorProfile> {
    const existing = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.vendorProfile.create({ data: { userId } });
  }

  /**
   * Resolves which steps are complete based on onboardingStep enum.
   */
  private resolveCompletedSteps(step: OnboardingStep): number[] {
    const map: Record<OnboardingStep, number[]> = {
      PENDING: [],
      STEP_1_DONE: [1],
      STEP_2_DONE: [1, 2],
      COMPLETED: [1, 2, 3],
    };
    return map[step] ?? [];
  }

  /**
   * Computes the next uncompleted step (null if fully onboarded).
   */
  private resolveNextStep(step: OnboardingStep): number | null {
    const map: Record<OnboardingStep, number | null> = {
      PENDING: 1,
      STEP_1_DONE: 2,
      STEP_2_DONE: 3,
      COMPLETED: null,
    };
    return map[step] ?? 1;
  }

  /**
   * Determines new OnboardingStep after completing a given step number.
   * Handles flexible ordering — only upgrades, never downgrades.
   */
  private resolveNewOnboardingStep(
    current: OnboardingStep,
    completedStep: 1 | 2 | 3,
    isOnboarded: boolean,
  ): { onboardingStep: OnboardingStep; isOnboarded: boolean } {
    // If already fully completed, keep as is
    if (current === OnboardingStep.COMPLETED) {
      return { onboardingStep: OnboardingStep.COMPLETED, isOnboarded: true };
    }

    const stepOrder: OnboardingStep[] = [
      OnboardingStep.PENDING,
      OnboardingStep.STEP_1_DONE,
      OnboardingStep.STEP_2_DONE,
      OnboardingStep.COMPLETED,
    ];

    const targetStep: OnboardingStep =
      completedStep === 1
        ? OnboardingStep.STEP_1_DONE
        : completedStep === 2
          ? OnboardingStep.STEP_2_DONE
          : OnboardingStep.COMPLETED;

    // Only upgrade, never downgrade
    const currentIdx = stepOrder.indexOf(current);
    const targetIdx = stepOrder.indexOf(targetStep);
    const newStep = targetIdx > currentIdx ? targetStep : current;
    const newIsOnboarded = newStep === OnboardingStep.COMPLETED || isOnboarded;

    return { onboardingStep: newStep, isOnboarded: newIsOnboarded };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Personal Profile
  // ─────────────────────────────────────────────────────────────────────────

  async getStep1(userId: string) {
    const [profile, user] = await Promise.all([
      this.getOrCreateProfile(userId),
      this.prisma.user.findUnique({ where: { userId } }),
    ]);

    return {
      onboardingStep: profile.onboardingStep,
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      gender: profile.gender,
      dob: profile.dob?.toISOString().split('T')[0] ?? null,
      profilePicture: profile.profilePicture,
    };
  }

  async updateStep1(
    userId: string,
    dto: VendorOnboardingStep1Dto,
    profilePictureFile?: Express.Multer.File,
  ) {
    // Validate file if provided
    if (profilePictureFile) {
      this.s3.validateFile(profilePictureFile);
    }

    const profile = await this.getOrCreateProfile(userId);

    // Upload profile picture to S3 if provided
    let profilePictureUrl: string | undefined;
    if (profilePictureFile) {
      const ext = profilePictureFile.originalname.split('.').pop() ?? 'jpg';
      profilePictureUrl = await this.s3.uploadFile(
        profilePictureFile,
        `vendors/${userId}/profile-picture.${ext}`,
      );
    }

    const { onboardingStep, isOnboarded } = this.resolveNewOnboardingStep(
      profile.onboardingStep,
      1,
      profile.isOnboarded,
    );

    const [updated, user] = await Promise.all([
      this.prisma.vendorProfile.update({
        where: { userId },
        data: {
          gender: dto.gender,
          dob: new Date(dto.dob),
          ...(profilePictureUrl !== undefined && { profilePicture: profilePictureUrl }),
          onboardingStep,
          isOnboarded,
        },
      }),
      this.prisma.user.findUnique({ where: { userId } }),
    ]);

    return {
      onboardingStep: updated.onboardingStep,
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      gender: updated.gender,
      dob: updated.dob?.toISOString().split('T')[0] ?? null,
      profilePicture: updated.profilePicture,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — Store Profile
  // ─────────────────────────────────────────────────────────────────────────

  async getStep2(userId: string) {
    const profile = await this.getOrCreateProfile(userId);

    return {
      onboardingStep: profile.onboardingStep,
      storeName: profile.storeName,
      storeDescription: profile.storeDescription,
      storeLogo: profile.storeLogo,
      storeCoverImages: profile.storeCoverImages ?? [],
      storeLocation: profile.storeLocation,
      jewelleryStartingPrice: profile.jewelleryStartingPrice
        ? Number(profile.jewelleryStartingPrice)
        : null,
      storeWebsite: profile.storeWebsite,
      storeContactNumber: profile.storeContactNumber,
      storeEmail: profile.storeEmail,
      storeOpeningTime: profile.storeOpeningTime,
      storeClosingTime: profile.storeClosingTime,
      storeFoundedYear: profile.storeFoundedYear,
    };
  }

  async updateStep2(
    userId: string,
    dto: VendorOnboardingStep2Dto,
    storeLogoFile?: Express.Multer.File,
    storeCoverFiles?: Express.Multer.File[],
  ) {
    // Validate files
    if (storeLogoFile) this.s3.validateFile(storeLogoFile);
    if (storeCoverFiles?.length) {
      this.s3.validateFiles(storeCoverFiles);
    }

    // Validate closing > opening
    if (dto.storeOpeningTime && dto.storeClosingTime) {
      if (dto.storeClosingTime <= dto.storeOpeningTime) {
        throw new CustomException(
          'storeClosingTime must be later than storeOpeningTime',
          'INVALID_TIME_RANGE',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const profile = await this.getOrCreateProfile(userId);

    // Check cover image total limit
    const existingCoverCount = profile.storeCoverImages?.length ?? 0;
    const newCoverCount = storeCoverFiles?.length ?? 0;
    if (existingCoverCount + newCoverCount > MAX_COVER_IMAGES) {
      throw new CustomException(
        `Store can have a maximum of ${MAX_COVER_IMAGES} cover images. Currently has ${existingCoverCount}.`,
        'TOO_MANY_IMAGES',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Upload store logo
    let storeLogoUrl: string | undefined;
    if (storeLogoFile) {
      const ext = storeLogoFile.originalname.split('.').pop() ?? 'jpg';
      storeLogoUrl = await this.s3.uploadFile(
        storeLogoFile,
        `vendors/${userId}/store-logo.${ext}`,
      );
    }

    // Upload cover images
    let newCoverUrls: string[] = [];
    if (storeCoverFiles?.length) {
      newCoverUrls = await this.s3.uploadFiles(
        storeCoverFiles,
        `vendors/${userId}/cover`,
      );
    }

    const mergedCoverImages = [...(profile.storeCoverImages ?? []), ...newCoverUrls];

    const { onboardingStep, isOnboarded } = this.resolveNewOnboardingStep(
      profile.onboardingStep,
      2,
      profile.isOnboarded,
    );

    const updated = await this.prisma.vendorProfile.update({
      where: { userId },
      data: {
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
        storeLocation: dto.storeLocation as object,
        jewelleryStartingPrice: dto.jewelleryStartingPrice,
        storeWebsite: dto.storeWebsite ?? null,
        storeContactNumber: dto.storeContactNumber,
        storeEmail: dto.storeEmail,
        storeOpeningTime: dto.storeOpeningTime,
        storeClosingTime: dto.storeClosingTime,
        storeFoundedYear: dto.storeFoundedYear,
        ...(storeLogoUrl !== undefined && { storeLogo: storeLogoUrl }),
        storeCoverImages: mergedCoverImages,
        onboardingStep,
        isOnboarded,
      },
    });

    return {
      onboardingStep: updated.onboardingStep,
      storeName: updated.storeName,
      storeDescription: updated.storeDescription,
      storeLogo: updated.storeLogo,
      storeCoverImages: updated.storeCoverImages,
      storeLocation: updated.storeLocation,
      jewelleryStartingPrice: updated.jewelleryStartingPrice
        ? Number(updated.jewelleryStartingPrice)
        : null,
      storeWebsite: updated.storeWebsite,
      storeContactNumber: updated.storeContactNumber,
      storeEmail: updated.storeEmail,
      storeOpeningTime: updated.storeOpeningTime,
      storeClosingTime: updated.storeClosingTime,
      storeFoundedYear: updated.storeFoundedYear,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3 — Jewellery Showcase
  // ─────────────────────────────────────────────────────────────────────────

  async getStep3(userId: string) {
    const profile = await this.getOrCreateProfile(userId);

    const items = await this.prisma.jewelleryShowcase.findMany({
      where: { vendorProfileId: profile.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      onboardingStep: profile.onboardingStep,
      isOnboarded: profile.isOnboarded,
      totalItems: items.length,
      showcase: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.imageUrl,
      })),
    };
  }

  async addShowcaseItems(
    userId: string,
    dto: VendorOnboardingStep3Dto,
    itemImages: Express.Multer.File[],
  ) {
    // Validate all images
    if (itemImages?.length) {
      this.s3.validateFiles(itemImages);
    }

    // Ensure each item has a corresponding image file
    if (!itemImages || itemImages.length !== dto.items.length) {
      throw new CustomException(
        'Each jewellery item must have exactly one image file',
        'INVALID_IMAGE',
        HttpStatus.BAD_REQUEST,
      );
    }

    const profile = await this.getOrCreateProfile(userId);

    // Check total showcase limit
    const existingCount = await this.prisma.jewelleryShowcase.count({
      where: { vendorProfileId: profile.id },
    });

    if (existingCount + dto.items.length > MAX_SHOWCASE_ITEMS) {
      throw new CustomException(
        `Showcase can have a maximum of ${MAX_SHOWCASE_ITEMS} items. Currently has ${existingCount}.`,
        'SHOWCASE_LIMIT_REACHED',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Upload images and create showcase items
    const createdItems = await Promise.all(
      dto.items.map(async (item, index) => {
        const file = itemImages[index];
        const ext = file.originalname.split('.').pop() ?? 'jpg';
        const imageUrl = await this.s3.uploadFile(
          file,
          `vendors/${userId}/showcase-${Date.now()}-${index + 1}.${ext}`,
        );

        return this.prisma.jewelleryShowcase.create({
          data: {
            vendorProfileId: profile.id,
            title: item.title,
            description: item.description ?? null,
            price: item.price,
            imageUrl,
          },
        });
      }),
    );

    const { onboardingStep, isOnboarded } = this.resolveNewOnboardingStep(
      profile.onboardingStep,
      3,
      profile.isOnboarded,
    );

    await this.prisma.vendorProfile.update({
      where: { userId },
      data: { onboardingStep, isOnboarded },
    });

    return {
      onboardingStep,
      isOnboarded,
      itemsAdded: createdItems.length,
      showcase: createdItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.imageUrl,
      })),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Delete Showcase Item
  // ─────────────────────────────────────────────────────────────────────────

  async deleteShowcaseItem(userId: string, itemId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new CustomException('Vendor profile not found', 'PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const item = await this.prisma.jewelleryShowcase.findFirst({
      where: { id: itemId, vendorProfileId: profile.id },
    });

    if (!item) {
      throw new CustomException(
        'Showcase item not found or does not belong to this vendor',
        'SHOWCASE_ITEM_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    // Delete image from S3
    await this.s3.deleteFileByUrl(item.imageUrl);

    await this.prisma.jewelleryShowcase.delete({ where: { id: itemId } });

    return { deletedItemId: itemId };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Onboarding Status
  // ─────────────────────────────────────────────────────────────────────────

  async getOnboardingStatus(userId: string) {
    const [profile, user] = await Promise.all([
      this.prisma.vendorProfile.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({ where: { userId } }),
    ]);

    const onboardingStep = profile?.onboardingStep ?? OnboardingStep.PENDING;
    const isOnboarded = profile?.isOnboarded ?? false;

    return {
      onboardingStep,
      isOnboarded,
      completedSteps: this.resolveCompletedSteps(onboardingStep),
      nextStep: this.resolveNextStep(onboardingStep),
      prefill: {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        mobileNumber: user?.mobileNumber ?? '',
      },
    };
  }

}
