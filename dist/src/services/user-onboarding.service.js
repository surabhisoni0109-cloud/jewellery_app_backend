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
exports.UserOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const s3_service_1 = require("./s3.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let UserOnboardingService = class UserOnboardingService {
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async getOrCreateProfile(userId) {
        const existing = await this.prisma.userProfile.findUnique({ where: { userId } });
        if (existing)
            return existing;
        return this.prisma.userProfile.create({ data: { userId } });
    }
    async getOnboarding(userId) {
        const [profile, user] = await Promise.all([
            this.getOrCreateProfile(userId),
            this.prisma.user.findUnique({ where: { userId } }),
        ]);
        return {
            isOnboarded: profile.isOnboarded,
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? '',
            mobileNumber: user?.mobileNumber ?? '',
            gender: profile.gender,
            dob: profile.dob?.toISOString().split('T')[0] ?? null,
            profilePicture: profile.profilePicture,
            location: profile.location,
        };
    }
    async submitOnboarding(userId, dto, profilePictureFile) {
        if (profilePictureFile) {
            this.s3.validateFile(profilePictureFile);
        }
        const [profile, currentUser] = await Promise.all([
            this.getOrCreateProfile(userId),
            this.prisma.user.findUnique({ where: { userId } }),
        ]);
        if (!currentUser) {
            throw new custom_exception_1.CustomException('User not found', 'USER_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        if (dto.mobileNumber && dto.mobileNumber.trim() !== currentUser.mobileNumber) {
            throw new custom_exception_1.CustomException('Mobile number cannot be updated', 'MOBILE_NUMBER_READ_ONLY', common_1.HttpStatus.BAD_REQUEST);
        }
        let normalizedEmail;
        if (dto.email) {
            normalizedEmail = dto.email.trim().toLowerCase();
            if (normalizedEmail !== currentUser.email.toLowerCase()) {
                const existingEmailUser = await this.prisma.user.findFirst({
                    where: {
                        email: normalizedEmail,
                        type: currentUser.type,
                        NOT: { userId },
                    },
                });
                if (existingEmailUser) {
                    throw new custom_exception_1.CustomException('An account with this email address already exists for the specified type', 'EMAIL_ALREADY_EXISTS', common_1.HttpStatus.CONFLICT);
                }
            }
        }
        let profilePictureUrl;
        if (profilePictureFile) {
            if (profile.profilePicture) {
                await this.s3.deleteFileByUrl(profile.profilePicture);
            }
            const ext = profilePictureFile.originalname.split('.').pop() ?? 'jpg';
            profilePictureUrl = await this.s3.uploadFile(profilePictureFile, `users/${userId}/profile-picture-${Date.now()}.${ext}`);
        }
        const userUpdateData = {};
        if (dto.firstName !== undefined) {
            userUpdateData.firstName = dto.firstName.trim();
        }
        if (dto.lastName !== undefined) {
            userUpdateData.lastName = dto.lastName.trim();
        }
        if (normalizedEmail !== undefined) {
            userUpdateData.email = normalizedEmail;
        }
        const [updatedProfile, updatedUser] = await Promise.all([
            this.prisma.userProfile.update({
                where: { userId },
                data: {
                    gender: dto.gender,
                    dob: new Date(dto.dob),
                    location: dto.location,
                    ...(profilePictureUrl !== undefined
                        ? { profilePicture: profilePictureUrl }
                        : dto.profilePicture !== undefined
                            ? { profilePicture: dto.profilePicture }
                            : {}),
                    isOnboarded: true,
                },
            }),
            Object.keys(userUpdateData).length > 0
                ? this.prisma.user.update({
                    where: { userId },
                    data: userUpdateData,
                })
                : currentUser,
        ]);
        return {
            isOnboarded: updatedProfile.isOnboarded,
            firstName: updatedUser?.firstName ?? '',
            lastName: updatedUser?.lastName ?? '',
            email: updatedUser?.email ?? '',
            mobileNumber: updatedUser?.mobileNumber ?? '',
            gender: updatedProfile.gender,
            dob: updatedProfile.dob?.toISOString().split('T')[0] ?? null,
            profilePicture: updatedProfile.profilePicture,
            location: updatedProfile.location,
        };
    }
};
exports.UserOnboardingService = UserOnboardingService;
exports.UserOnboardingService = UserOnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], UserOnboardingService);
//# sourceMappingURL=user-onboarding.service.js.map