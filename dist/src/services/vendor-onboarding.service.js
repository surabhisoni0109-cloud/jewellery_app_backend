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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const s3_service_1 = require("./s3.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const client_1 = require("@prisma/client");
const MAX_SHOWCASE_ITEMS = 5;
const MAX_COVER_IMAGES = 5;
let VendorOnboardingService = class VendorOnboardingService {
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async getOrCreateProfile(userId) {
        const existing = await this.prisma.vendorProfile.findUnique({ where: { userId } });
        if (existing)
            return existing;
        return this.prisma.vendorProfile.create({ data: { userId } });
    }
    resolveCompletedSteps(step) {
        const map = {
            PENDING: [],
            STEP_1_DONE: [1],
            STEP_2_DONE: [1, 2],
            COMPLETED: [1, 2],
        };
        return map[step] ?? [];
    }
    resolveNextStep(step) {
        const map = {
            PENDING: 1,
            STEP_1_DONE: 2,
            STEP_2_DONE: null,
            COMPLETED: null,
        };
        return step in map ? map[step] : 1;
    }
    resolveNewOnboardingStep(current, completedStep, isOnboarded) {
        if (current === client_1.OnboardingStep.COMPLETED) {
            return { onboardingStep: client_1.OnboardingStep.COMPLETED, isOnboarded: true };
        }
        const stepOrder = [
            client_1.OnboardingStep.PENDING,
            client_1.OnboardingStep.STEP_1_DONE,
            client_1.OnboardingStep.STEP_2_DONE,
            client_1.OnboardingStep.COMPLETED,
        ];
        const targetStep = completedStep === 1
            ? client_1.OnboardingStep.STEP_1_DONE
            : client_1.OnboardingStep.COMPLETED;
        const currentIdx = stepOrder.indexOf(current);
        const targetIdx = stepOrder.indexOf(targetStep);
        const newStep = targetIdx > currentIdx ? targetStep : current;
        const newIsOnboarded = newStep === client_1.OnboardingStep.COMPLETED || isOnboarded;
        return { onboardingStep: newStep, isOnboarded: newIsOnboarded };
    }
    async getStep1(userId) {
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
    async updateStep1(userId, dto, profilePictureFile) {
        if (profilePictureFile) {
            this.s3.validateFile(profilePictureFile);
        }
        const profile = await this.getOrCreateProfile(userId);
        let profilePictureUrl;
        if (profilePictureFile) {
            const ext = profilePictureFile.originalname.split('.').pop() ?? 'jpg';
            profilePictureUrl = await this.s3.uploadFile(profilePictureFile, `vendors/${userId}/profile-picture.${ext}`);
        }
        const { onboardingStep, isOnboarded } = this.resolveNewOnboardingStep(profile.onboardingStep, 1, profile.isOnboarded);
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
    async getStep2(userId) {
        const profile = await this.getOrCreateProfile(userId);
        return {
            onboardingStep: profile.onboardingStep,
            isOnboarded: profile.isOnboarded,
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
            storeOwnerName: profile.storeOwnerName ?? null,
            whatsappNumber: profile.whatsappNumber ?? null,
            storeEmail: profile.storeEmail,
            storeOpeningTime: profile.storeOpeningTime,
            storeClosingTime: profile.storeClosingTime,
            storeFoundedYear: profile.storeFoundedYear,
        };
    }
    async updateStep2(userId, dto, storeLogoFile, storeCoverFiles) {
        if (storeLogoFile)
            this.s3.validateFile(storeLogoFile);
        if (storeCoverFiles?.length) {
            this.s3.validateFiles(storeCoverFiles);
        }
        if (dto.storeOpeningTime && dto.storeClosingTime) {
            if (dto.storeClosingTime <= dto.storeOpeningTime) {
                throw new custom_exception_1.CustomException('storeClosingTime must be later than storeOpeningTime', 'INVALID_TIME_RANGE', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const profile = await this.getOrCreateProfile(userId);
        const existingCoverCount = profile.storeCoverImages?.length ?? 0;
        const newCoverCount = storeCoverFiles?.length ?? 0;
        if (existingCoverCount + newCoverCount > MAX_COVER_IMAGES) {
            throw new custom_exception_1.CustomException(`Store can have a maximum of ${MAX_COVER_IMAGES} cover images. Currently has ${existingCoverCount}.`, 'TOO_MANY_IMAGES', common_1.HttpStatus.BAD_REQUEST);
        }
        let storeLogoUrl;
        if (storeLogoFile) {
            const ext = storeLogoFile.originalname.split('.').pop() ?? 'jpg';
            storeLogoUrl = await this.s3.uploadFile(storeLogoFile, `vendors/${userId}/store-logo.${ext}`);
        }
        let newCoverUrls = [];
        if (storeCoverFiles?.length) {
            newCoverUrls = await this.s3.uploadFiles(storeCoverFiles, `vendors/${userId}/cover`);
        }
        const mergedCoverImages = [...(profile.storeCoverImages ?? []), ...newCoverUrls];
        const { onboardingStep, isOnboarded } = this.resolveNewOnboardingStep(profile.onboardingStep, 2, profile.isOnboarded);
        const updated = await this.prisma.vendorProfile.update({
            where: { userId },
            data: {
                storeName: dto.storeName,
                storeDescription: dto.storeDescription,
                storeLocation: dto.storeLocation,
                jewelleryStartingPrice: dto.jewelleryStartingPrice,
                storeWebsite: dto.storeWebsite ?? null,
                storeContactNumber: dto.storeContactNumber,
                storeOwnerName: dto.storeOwnerName ?? undefined,
                whatsappNumber: dto.whatsappNumber ?? undefined,
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
            isOnboarded: updated.isOnboarded,
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
            storeOwnerName: updated.storeOwnerName ?? null,
            whatsappNumber: updated.whatsappNumber ?? null,
            storeEmail: updated.storeEmail,
            storeOpeningTime: updated.storeOpeningTime,
            storeClosingTime: updated.storeClosingTime,
            storeFoundedYear: updated.storeFoundedYear,
        };
    }
    async getStep3(userId) {
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
    async addShowcaseItems(userId, dto, itemImages) {
        if (itemImages?.length) {
            this.s3.validateFiles(itemImages);
        }
        if (!itemImages || itemImages.length !== dto.items.length) {
            throw new custom_exception_1.CustomException('Each jewellery item must have exactly one image file', 'INVALID_IMAGE', common_1.HttpStatus.BAD_REQUEST);
        }
        const profile = await this.getOrCreateProfile(userId);
        const existingCount = await this.prisma.jewelleryShowcase.count({
            where: { vendorProfileId: profile.id },
        });
        if (existingCount + dto.items.length > MAX_SHOWCASE_ITEMS) {
            throw new custom_exception_1.CustomException(`Showcase can have a maximum of ${MAX_SHOWCASE_ITEMS} items. Currently has ${existingCount}.`, 'SHOWCASE_LIMIT_REACHED', common_1.HttpStatus.BAD_REQUEST);
        }
        const createdItems = await Promise.all(dto.items.map(async (item, index) => {
            const file = itemImages[index];
            const ext = file.originalname.split('.').pop() ?? 'jpg';
            const imageUrl = await this.s3.uploadFile(file, `vendors/${userId}/showcase-${Date.now()}-${index + 1}.${ext}`);
            return this.prisma.jewelleryShowcase.create({
                data: {
                    vendorProfileId: profile.id,
                    title: item.title,
                    description: item.description ?? null,
                    price: item.price,
                    imageUrl,
                },
            });
        }));
        const { onboardingStep, isOnboarded } = this.resolveNewOnboardingStep(profile.onboardingStep, 3, profile.isOnboarded);
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
    async deleteShowcaseItem(userId, itemId) {
        const profile = await this.prisma.vendorProfile.findUnique({ where: { userId } });
        if (!profile) {
            throw new custom_exception_1.CustomException('Vendor profile not found', 'PROFILE_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const item = await this.prisma.jewelleryShowcase.findFirst({
            where: { id: itemId, vendorProfileId: profile.id },
        });
        if (!item) {
            throw new custom_exception_1.CustomException('Showcase item not found or does not belong to this vendor', 'SHOWCASE_ITEM_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        await this.s3.deleteFileByUrl(item.imageUrl);
        await this.prisma.jewelleryShowcase.delete({ where: { id: itemId } });
        return { deletedItemId: itemId };
    }
    async getOnboardingStatus(userId) {
        const [profile, user] = await Promise.all([
            this.prisma.vendorProfile.findUnique({ where: { userId } }),
            this.prisma.user.findUnique({ where: { userId } }),
        ]);
        const onboardingStep = profile?.onboardingStep ?? client_1.OnboardingStep.PENDING;
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
};
exports.VendorOnboardingService = VendorOnboardingService;
exports.VendorOnboardingService = VendorOnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], VendorOnboardingService);
//# sourceMappingURL=vendor-onboarding.service.js.map