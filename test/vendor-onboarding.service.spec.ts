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
