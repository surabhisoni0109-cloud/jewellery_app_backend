import { Test, TestingModule } from '@nestjs/testing';
import { UserStoresService } from '../src/services/user-stores.service';
import { PrismaService } from '../src/services/prisma.service';
import { CustomException } from '../src/common/exceptions/custom-exception';

describe('UserStoresService', () => {
  let service: UserStoresService;

  const mockStore = {
    id: 'store-uuid-1',
    userId: 'VND100001',
    storeName: 'Soni Jewellers',
    storeDescription: 'Handmade luxury jewellery',
    storeLogo: 'https://s3.../logo.jpg',
    storeCoverImages: ['https://s3.../cover1.jpg'],
    storeLocation: {
      latitude: 28.6139,
      longitude: 77.209,
      addressLine1: '123 Gold St',
      area: 'Karol Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110005',
    },
    jewelleryStartingPrice: 1500,
    storeWebsite: 'https://soni.com',
    storeContactNumber: '9876543210',
    storeOwnerName: 'Ramesh Soni',
    whatsappNumber: '9876543210',
    storeEmail: 'contact@soni.com',
    storeOpeningTime: '00:00',
    storeClosingTime: '23:59',
    storeFoundedYear: 1985,
    isOnboarded: true,
    createdAt: new Date('2026-01-01'),
    ratings: [{ rating: 5 }, { rating: 4 }],
  };

  const mockUser = {
    id: 'user-uuid-1',
    userId: 'USR100001',
    firstName: 'Priya',
    lastName: 'Verma',
    mobileNumber: '9876543210',
  };

  const mockUserProfile = {
    userId: 'USR100001',
    profilePicture: 'https://s3.../user.jpg',
  };

  const mockPrismaService = {
    vendorProfile: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    vendorStoreView: {
      create: jest.fn().mockResolvedValue({ id: 'view-1' }),
    },
    vendorRating: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    jewelleryShowcase: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
    },
    vendorEnquiry: {
      count: jest.fn(),
      create: jest.fn(),
    },
    notification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStoresService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserStoresService>(UserStoresService);
  });

  describe('getStores', () => {
    it('should list stores with distance, rating, and open status', async () => {
      mockPrismaService.vendorProfile.findMany.mockResolvedValue([mockStore]);

      const res = await service.getStores({
        latitude: 28.6139,
        longitude: 77.209,
        city: 'New Delhi',
      });

      expect(res.items.length).toBe(1);
      expect(res.items[0].storeName).toBe('Soni Jewellers');
      expect(res.items[0].averageRating).toBe(4.5);
      expect(res.items[0].totalReviews).toBe(2);
      expect(res.items[0].distanceKm).toBe(0); // same coordinates
      expect(res.items[0].isOpen).toBe(true);
    });

    it('should filter stores by search keyword, store UUID, or vendor ID', async () => {
      mockPrismaService.vendorProfile.findMany.mockResolvedValue([mockStore]);

      const res = await service.getStores({ search: 'NonExistent' });
      expect(res.items.length).toBe(0);

      // Search by Area
      const resArea = await service.getStores({ search: 'Karol Bagh' });
      expect(resArea.items.length).toBe(1);

      // Search by Store UUID
      const resUuid = await service.getStores({ search: 'store-uuid-1' });
      expect(resUuid.items.length).toBe(1);

      // Search by Vendor ID
      const resVendorId = await service.getStores({ search: 'VND100001' });
      expect(resVendorId.items.length).toBe(1);
    });

    it('should automatically use UserProfile location if logged in and query coordinates not provided', async () => {
      mockPrismaService.vendorProfile.findMany.mockResolvedValue([mockStore]);
      mockPrismaService.userProfile.findUnique.mockResolvedValue({
        userId: 'USR100001',
        location: {
          latitude: 28.6139,
          longitude: 77.209,
          city: 'New Delhi',
        },
      });

      const res = await service.getStores({}, 'USR100001');
      expect(res.items.length).toBe(1);
      expect(res.items[0].distanceKm).toBe(0);
    });
  });

  describe('getStoreDetails', () => {
    it('should return store details, rating distribution, and auto-computed distance from user profile', async () => {
      mockPrismaService.vendorProfile.findFirst.mockResolvedValue(mockStore);
      mockPrismaService.userProfile.findUnique.mockResolvedValue({
        userId: 'USR100001',
        location: {
          latitude: 28.6139,
          longitude: 77.209,
        },
      });
      mockPrismaService.vendorRating.findMany.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
      ]);

      const res = await service.getStoreDetails('store-uuid-1', 'USR100001');

      expect(res.storeName).toBe('Soni Jewellers');
      expect(res.ratingSummary.averageRating).toBe(4.5);
      expect(res.ratingSummary.totalReviews).toBe(2);
      expect(res.ratingSummary.distribution[5]).toBe(1);
      expect(res.ratingSummary.distribution[4]).toBe(1);
      expect(res.distanceKm).toBe(0);
      expect(mockPrismaService.vendorStoreView.create).toHaveBeenCalledWith({
        data: {
          vendorProfileId: 'store-uuid-1',
          viewerUserId: 'USR100001',
        },
      });
    });

    it('should throw NOT_FOUND if store does not exist', async () => {
      mockPrismaService.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(service.getStoreDetails('invalid')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('getStoreJewellery', () => {
    it('should return paginated published jewellery items', async () => {
      mockPrismaService.vendorProfile.findFirst.mockResolvedValue(mockStore);
      mockPrismaService.jewelleryShowcase.count.mockResolvedValue(1);
      mockPrismaService.jewelleryShowcase.findMany.mockResolvedValue([
        {
          id: 'jewel-1',
          title: 'Gold Ring',
          description: '22K Gold',
          price: 5000,
          imageUrl: 'https://s3.../ring.jpg',
          images: [],
          jewelleryType: 'Ring',
          weight: '5g',
          purity: '22K',
          gender: 'FEMALE',
          hasDiscount: false,
          discountPercentage: null,
          discountPrice: null,
          hasSpecialOccasion: false,
          specialOccasionName: null,
          specialOccasionDate: null,
        },
      ]);

      const res = await service.getStoreJewellery('store-uuid-1', { page: 1, limit: 10 });

      expect(res.items.length).toBe(1);
      expect(res.items[0].title).toBe('Gold Ring');
      expect(res.pagination.total).toBe(1);
    });
  });

  describe('createOrUpdateRating', () => {
    it('should create new rating if user has not reviewed', async () => {
      mockPrismaService.vendorProfile.findFirst.mockResolvedValue(mockStore);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrismaService.vendorRating.findFirst.mockResolvedValue(null);
      mockPrismaService.vendorRating.create.mockResolvedValue({
        id: 'rating-1',
        rating: 5,
        review: 'Great!',
      });

      const res = await service.createOrUpdateRating('USR100001', 'store-uuid-1', {
        rating: 5,
        review: 'Great!',
      });

      expect(res.message).toBe('Review submitted successfully');
      expect(mockPrismaService.vendorRating.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          vendorProfileId: 'store-uuid-1',
          customerId: 'USR100001',
          customerName: 'Priya Verma',
          rating: 5,
        }),
      });
    });

    it('should update existing rating if user already reviewed', async () => {
      mockPrismaService.vendorProfile.findFirst.mockResolvedValue(mockStore);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrismaService.vendorRating.findFirst.mockResolvedValue({
        id: 'existing-rating',
        rating: 4,
        review: 'Good',
      });
      mockPrismaService.vendorRating.update.mockResolvedValue({
        id: 'existing-rating',
        rating: 5,
        review: 'Updated to great!',
      });

      const res = await service.createOrUpdateRating('USR100001', 'store-uuid-1', {
        rating: 5,
        review: 'Updated to great!',
      });

      expect(res.message).toBe('Review updated successfully');
      expect(mockPrismaService.vendorRating.update).toHaveBeenCalled();
    });
  });

  describe('createEnquiry', () => {
    it('should submit customer enquiry and notify vendor', async () => {
      mockPrismaService.vendorProfile.findFirst.mockResolvedValue(mockStore);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userProfile.findUnique.mockResolvedValue(mockUserProfile);
      mockPrismaService.vendorEnquiry.count.mockResolvedValue(5);
      mockPrismaService.vendorEnquiry.create.mockResolvedValue({
        enquiryId: 'ENQ100006',
        customerName: 'Priya Verma',
        message: 'Is customization available?',
        jewelleryId: null,
        createdAt: new Date(),
      });

      const res = await service.createEnquiry('USR100001', 'store-uuid-1', {
        message: 'Is customization available?',
      });

      expect(res.enquiryId).toBe('ENQ100006');
      expect(res.customerName).toBe('Priya Verma');
      expect(mockPrismaService.vendorEnquiry.create).toHaveBeenCalled();
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'VND100001',
          title: 'New Customer Enquiry',
        }),
      });
    });
  });
});
