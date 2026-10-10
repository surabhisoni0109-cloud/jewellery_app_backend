import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { CustomException } from '../common/exceptions/custom-exception';
import { UserOnboardingDto } from '../dto/user-onboarding.dto';
import { UserProfile } from '@prisma/client';

@Injectable()
export class UserOnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /**
   * Fetches or creates the UserProfile for a given userId.
   */
  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.userProfile.create({ data: { userId } });
  }

  /**
   * GET /api/user/onboarding
   * Returns current onboarding details and user info.
   */
  async getOnboarding(userId: string) {
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

  /**
   * POST & PATCH /api/user/onboarding
   * Submits or updates user onboarding details.
   */
  async submitOnboarding(
    userId: string,
    dto: UserOnboardingDto,
    profilePictureFile?: Express.Multer.File,
  ) {
    // Validate file if provided
    if (profilePictureFile) {
      this.s3.validateFile(profilePictureFile);
    }

    const [profile, currentUser] = await Promise.all([
      this.getOrCreateProfile(userId),
      this.prisma.user.findUnique({ where: { userId } }),
    ]);

    if (!currentUser) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // Mobile number cannot be updated
    if (dto.mobileNumber && dto.mobileNumber.trim() !== currentUser.mobileNumber) {
      throw new CustomException(
        'Mobile number cannot be updated',
        'MOBILE_NUMBER_READ_ONLY',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check email uniqueness if email is changed
    let normalizedEmail: string | undefined;
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
          throw new CustomException(
            'An account with this email address already exists for the specified type',
            'EMAIL_ALREADY_EXISTS',
            HttpStatus.CONFLICT,
          );
        }
      }
    }

    // Upload profile picture to S3 if provided
    let profilePictureUrl: string | undefined;
    if (profilePictureFile) {
      if (profile.profilePicture) {
        await this.s3.deleteFileByUrl(profile.profilePicture);
      }
      const ext = profilePictureFile.originalname.split('.').pop() ?? 'jpg';
      profilePictureUrl = await this.s3.uploadFile(
        profilePictureFile,
        `users/${userId}/profile-picture-${Date.now()}.${ext}`,
      );
    }

    // Prepare user updates
    const userUpdateData: { firstName?: string; lastName?: string; email?: string } = {};
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
          location: dto.location as object,
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
}
