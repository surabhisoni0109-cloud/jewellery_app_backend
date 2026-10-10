import { Test, TestingModule } from '@nestjs/testing';
import { VendorOnboardingService } from '../src/services/vendor-onboarding.service';
import { PrismaService } from '../src/services/prisma.service';
import { S3Service } from '../src/services/s3.service';
import { Gender, OnboardingStep } from '@prisma/client';
import { CustomException } from '../src/common/exceptions/custom-exception';

describe('VendorOnboardingService', () => {
  let service: VendorOnboardingService;

  const mockPrismaService = {
    vendorProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    jewelleryShowcase: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockS3Service = {
    validateFile: jest.fn(),
    validateFiles: jest.fn(),
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    deleteFileByUrl: jest.fn(),
  };

  const mockUser = {
    id: 'user-uuid-1',
    userId: 'VND100001',
    type: 'VENDOR',
    firstName: 'OldFirst',
    lastName: 'OldLast',
    email: 'old@example.com',
    mobileNumber: '9876543210',
  };

  const mockProfile = {
    id: 'profile-uuid-1',
    userId: 'VND100001',
    gender: Gender.MALE,
    dob: new Date('1990-01-01'),
    profilePicture: null,
    storeName: 'Soni Jewellers',
    storeDescription: 'Best jewellers',
    storeLogo: null,
    storeCoverImages: [],
    storeLocation: { city: 'Jaipur' },
    jewelleryStartingPrice: 500,
    storeWebsite: 'https://soni.com',
    storeContactNumber: '9876543210',
    storeOwnerName: 'Ramesh Soni',
    whatsappNumber: '9876543210',
    storeEmail: 'contact@soni.com',
    storeOpeningTime: '10:00',
    storeClosingTime: '20:00',
    storeFoundedYear: 2000,
    onboardingStep: OnboardingStep.STEP_1_DONE,
    isOnboarded: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorOnboardingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<VendorOnboardingService>(VendorOnboardingService);
  });

  describe('updateStep1', () => {
    it('should update gender and dob in VendorProfile', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const updatedProfile = {
        ...mockProfile,
        gender: Gender.FEMALE,
        dob: new Date('1992-05-15'),
        onboardingStep: OnboardingStep.STEP_1_DONE,
      };
      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedProfile);

      const res = await service.updateStep1('VND100001', {
        gender: Gender.FEMALE,
        dob: '1992-05-15',
      });

      expect(mockPrismaService.vendorProfile.update).toHaveBeenCalledWith({
        where: { userId: 'VND100001' },
        data: expect.objectContaining({
          gender: Gender.FEMALE,
          dob: new Date('1992-05-15'),
        }),
      });

      expect(res.gender).toBe(Gender.FEMALE);
      expect(res.dob).toBe('1992-05-15');
      expect(res.firstName).toBe('OldFirst');
    });

    it('should update firstName, lastName, and email in User', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const updatedProfile = {
        ...mockProfile,
        gender: Gender.MALE,
        dob: new Date('1990-01-01'),
        onboardingStep: OnboardingStep.STEP_1_DONE,
      };
      const updatedUser = {
        ...mockUser,
        firstName: 'Yogesh',
        lastName: 'Kumawat',
        email: 'yogesh@example.com',
      };

      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedProfile);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const res = await service.updateStep1('VND100001', {
        gender: Gender.MALE,
        dob: '1990-01-01',
        firstName: 'Yogesh',
        lastName: 'Kumawat',
        email: 'yogesh@example.com',
        mobileNumber: '9876543210', // same as current mobileNumber, allowed
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId: 'VND100001' },
        data: {
          firstName: 'Yogesh',
          lastName: 'Kumawat',
          email: 'yogesh@example.com',
        },
      });

      expect(res.firstName).toBe('Yogesh');
      expect(res.lastName).toBe('Kumawat');
      expect(res.email).toBe('yogesh@example.com');
      expect(res.mobileNumber).toBe('9876543210');
    });

    it('should throw an error if attempting to update mobileNumber', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.updateStep1('VND100001', {
          gender: Gender.MALE,
          dob: '1990-01-01',
          mobileNumber: '9999999999', // different from 9876543210
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw conflict error if new email is already taken by another vendor', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'other-user', userId: 'VND999999' });

      await expect(
        service.updateStep1('VND100001', {
          gender: Gender.MALE,
          dob: '1990-01-01',
          email: 'existing@example.com',
        }),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('Step 2: getStep2 & updateStep2', () => {
    it('should return storeOwnerName and whatsappNumber in getStep2', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);

      const res = await service.getStep2('VND100001');

      expect(res.storeOwnerName).toBe('Ramesh Soni');
      expect(res.whatsappNumber).toBe('9876543210');
    });

    it('should update storeOwnerName and whatsappNumber and complete onboarding in updateStep2', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
      const updatedProfile = {
        ...mockProfile,
        storeOwnerName: 'Suresh Soni',
        whatsappNumber: '9123456780',
        onboardingStep: OnboardingStep.COMPLETED,
        isOnboarded: true,
      };
      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedProfile);

      const res = await service.updateStep2('VND100001', {
        storeName: 'Soni Jewellers',
        storeDescription: 'Best in town',
        storeLocation: {
          addressLine1: '123 Main St',
          area: 'Bapu Bazaar',
          city: 'Jaipur',
          state: 'Rajasthan',
          country: 'India',
          pincode: '302001',
        },
        jewelleryStartingPrice: 1000,
        storeContactNumber: '9876543210',
        storeOwnerName: 'Suresh Soni',
        whatsappNumber: '9123456780',
        storeEmail: 'suresh@soni.com',
        storeOpeningTime: '10:00',
        storeClosingTime: '20:00',
        storeFoundedYear: 2005,
      });

      expect(mockPrismaService.vendorProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'VND100001' },
          data: expect.objectContaining({
            storeOwnerName: 'Suresh Soni',
            whatsappNumber: '9123456780',
            onboardingStep: OnboardingStep.COMPLETED,
            isOnboarded: true,
          }),
        }),
      );

      expect(res.storeOwnerName).toBe('Suresh Soni');
      expect(res.whatsappNumber).toBe('9123456780');
      expect(res.onboardingStep).toBe(OnboardingStep.COMPLETED);
      expect(res.isOnboarded).toBe(true);
    });

    it('should throw TOO_MANY_IMAGES if vendor has 5 images and tries to upload another without replacing', async () => {
      const profileWith5 = {
        ...mockProfile,
        storeCoverImages: ['url1', 'url2', 'url3', 'url4', 'url5'],
      };
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(profileWith5);

      const fakeFile = {
        originalname: 'new.jpg',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      await expect(
        service.updateStep2(
          'VND100001',
          {
            storeName: 'Soni Jewellers',
            storeDescription: 'Best in town',
            storeLocation: {
              addressLine1: '123 Main St',
              area: 'Bapu Bazaar',
              city: 'Jaipur',
              state: 'Rajasthan',
              country: 'India',
              pincode: '302001',
            },
            jewelleryStartingPrice: 1000,
            storeContactNumber: '9876543210',
            storeEmail: 'suresh@soni.com',
            storeOpeningTime: '10:00',
            storeClosingTime: '20:00',
            storeFoundedYear: 2005,
          },
          undefined,
          [fakeFile],
        ),
      ).rejects.toThrow(CustomException);
    });

    it('should allow vendor to replace an image by omitting it in existingCoverImages and uploading a new one', async () => {
      const profileWith5 = {
        ...mockProfile,
        storeCoverImages: ['url1', 'url2', 'url3', 'url4', 'url5'],
      };
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(profileWith5);
      mockS3Service.uploadFiles.mockResolvedValue(['url-new']);

      const updatedProfile = {
        ...mockProfile,
        storeCoverImages: ['url1', 'url2', 'url3', 'url4', 'url-new'],
      };
      mockPrismaService.vendorProfile.update.mockResolvedValue(updatedProfile);

      const fakeFile = {
        originalname: 'new.jpg',
        mimetype: 'image/jpeg',
        size: 1000,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const res = await service.updateStep2(
        'VND100001',
        {
          storeName: 'Soni Jewellers',
          storeDescription: 'Best in town',
          storeLocation: {
            addressLine1: '123 Main St',
            area: 'Bapu Bazaar',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            pincode: '302001',
          },
          jewelleryStartingPrice: 1000,
          storeContactNumber: '9876543210',
          storeEmail: 'suresh@soni.com',
          storeOpeningTime: '10:00',
          storeClosingTime: '20:00',
          storeFoundedYear: 2005,
          existingCoverImages: ['url1', 'url2', 'url3', 'url4'], // omitted url5 (replacing it)
        },
        undefined,
        [fakeFile],
      );

      expect(mockS3Service.deleteFileByUrl).toHaveBeenCalledWith('url5');
      expect(res.storeCoverImages).toEqual(['url1', 'url2', 'url3', 'url4', 'url-new']);
    });

    it('should delete a cover image via deleteCoverImage', async () => {
      const profileWithImages = {
        ...mockProfile,
        storeCoverImages: ['url1', 'url2', 'url3'],
      };
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(profileWithImages);
      mockPrismaService.vendorProfile.update.mockResolvedValue({
        ...profileWithImages,
        storeCoverImages: ['url1', 'url3'],
      });

      const res = await service.deleteCoverImage('VND100001', { imageUrl: 'url2' });

      expect(mockS3Service.deleteFileByUrl).toHaveBeenCalledWith('url2');
      expect(res.storeCoverImages).toEqual(['url1', 'url3']);
      expect(res.deletedImageUrl).toBe('url2');
    });

    it('should throw IMAGE_NOT_FOUND when deleting a non-existent cover image', async () => {
      const profileWithImages = {
        ...mockProfile,
        storeCoverImages: ['url1'],
      };
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(profileWithImages);

      await expect(
        service.deleteCoverImage('VND100001', { imageUrl: 'not-exists' }),
      ).rejects.toThrow(CustomException);
    });

    it('should delete store logo via deleteStoreLogo', async () => {
      const profileWithLogo = {
        ...mockProfile,
        storeLogo: 'https://s3.../logo.jpg',
      };
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue(profileWithLogo);
      mockPrismaService.vendorProfile.update.mockResolvedValue({
        ...profileWithLogo,
        storeLogo: null,
      });

      const res = await service.deleteStoreLogo('VND100001');

      expect(mockS3Service.deleteFileByUrl).toHaveBeenCalledWith('https://s3.../logo.jpg');
      expect(res.storeLogo).toBeNull();
    });

    it('should return completedSteps [1, 2] and nextStep null when COMPLETED in getOnboardingStatus', async () => {
      mockPrismaService.vendorProfile.findUnique.mockResolvedValue({
        ...mockProfile,
        onboardingStep: OnboardingStep.COMPLETED,
        isOnboarded: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const res = await service.getOnboardingStatus('VND100001');

      expect(res.onboardingStep).toBe(OnboardingStep.COMPLETED);
      expect(res.isOnboarded).toBe(true);
      expect(res.completedSteps).toEqual([1, 2]);
      expect(res.nextStep).toBeNull();
    });
  });
});
