import { Test, TestingModule } from '@nestjs/testing';
import { UserOnboardingService } from '../src/services/user-onboarding.service';
import { PrismaService } from '../src/services/prisma.service';
import { S3Service } from '../src/services/s3.service';
import { Gender } from '@prisma/client';
import { CustomException } from '../src/common/exceptions/custom-exception';

describe('UserOnboardingService', () => {
  let service: UserOnboardingService;

  const mockPrismaService = {
    userProfile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockS3Service = {
    validateFile: jest.fn(),
    uploadFile: jest.fn(),
    deleteFileByUrl: jest.fn(),
  };

  const mockUser = {
    id: 'user-uuid-1',
    userId: 'USR100001',
    type: 'USER',
    firstName: 'OldFirst',
    lastName: 'OldLast',
    email: 'old@example.com',
    mobileNumber: '9876543210',
  };

  const mockProfile = {
    id: 'profile-uuid-1',
    userId: 'USR100001',
    gender: Gender.MALE,
    dob: new Date('1995-06-15'),
    profilePicture: null,
    location: {
      addressLine1: '123 Gold St',
      area: 'Karol Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110005',
    },
    isOnboarded: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserOnboardingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<UserOnboardingService>(UserOnboardingService);
  });

  describe('getOnboarding', () => {
    it('should return onboarding details for user', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const res = await service.getOnboarding('USR100001');

      expect(res.isOnboarded).toBe(false);
      expect(res.firstName).toBe('OldFirst');
      expect(res.lastName).toBe('OldLast');
      expect(res.email).toBe('old@example.com');
      expect(res.mobileNumber).toBe('9876543210');
      expect(res.gender).toBe(Gender.MALE);
      expect(res.dob).toBe('1995-06-15');
      expect(res.location).toEqual(mockProfile.location);
    });
  });

  describe('submitOnboarding', () => {
    it('should submit onboarding and mark isOnboarded true', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const updatedProfile = {
        ...mockProfile,
        gender: Gender.FEMALE,
        dob: new Date('1998-01-20'),
        location: {
          addressLine1: '456 Silver Lane',
          area: 'Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001',
        },
        isOnboarded: true,
      };

      const updatedUser = {
        ...mockUser,
        firstName: 'Yogesh',
        lastName: 'Kumawat',
        email: 'yogesh@example.com',
      };

      mockPrismaService.userProfile.update.mockResolvedValue(updatedProfile);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const res = await service.submitOnboarding('USR100001', {
        firstName: 'Yogesh',
        lastName: 'Kumawat',
        email: 'yogesh@example.com',
        mobileNumber: '9876543210',
        gender: Gender.FEMALE,
        dob: '1998-01-20',
        location: {
          addressLine1: '456 Silver Lane',
          area: 'Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001',
        },
      });

      expect(mockPrismaService.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 'USR100001' },
        data: expect.objectContaining({
          gender: Gender.FEMALE,
          dob: new Date('1998-01-20'),
          isOnboarded: true,
        }),
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { userId: 'USR100001' },
        data: {
          firstName: 'Yogesh',
          lastName: 'Kumawat',
          email: 'yogesh@example.com',
        },
      });

      expect(res.isOnboarded).toBe(true);
      expect(res.firstName).toBe('Yogesh');
      expect(res.lastName).toBe('Kumawat');
      expect(res.email).toBe('yogesh@example.com');
      expect(res.gender).toBe(Gender.FEMALE);
      expect(res.dob).toBe('1998-01-20');
    });

    it('should throw an error if attempting to update mobileNumber', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.submitOnboarding('USR100001', {
          gender: Gender.MALE,
          dob: '1995-06-15',
          location: mockProfile.location,
          mobileNumber: '9999999999', // different from 9876543210
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw conflict error if new email is already taken by another user', async () => {
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'other-user', userId: 'USR999999' });

      await expect(
        service.submitOnboarding('USR100001', {
          gender: Gender.MALE,
          dob: '1995-06-15',
          location: mockProfile.location,
          email: 'taken@example.com',
        }),
      ).rejects.toThrow(CustomException);
    });
  });
});
