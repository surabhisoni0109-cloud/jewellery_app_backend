"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const vendor_dashboard_service_1 = require("../src/services/vendor-dashboard.service");
const prisma_service_1 = require("../src/services/prisma.service");
const vendor_dashboard_dto_1 = require("../src/dto/vendor-dashboard.dto");
const custom_exception_1 = require("../src/common/exceptions/custom-exception");
describe('VendorDashboardService', () => {
    let service;
    const mockPrismaService = {
        vendorProfile: {
            findUnique: jest.fn(),
        },
        vendorStoreView: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        vendorEnquiry: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        vendorRating: {
            count: jest.fn(),
            findMany: jest.fn(),
            groupBy: jest.fn(),
        },
        jewelleryShowcase: {
            count: jest.fn(),
        },
    };
    const mockProfile = {
        id: 'profile-uuid-1',
        userId: 'VND100001',
        storeName: 'Soni Jewellers',
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                vendor_dashboard_service_1.VendorDashboardService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
            ],
        }).compile();
        service = module.get(vendor_dashboard_service_1.VendorDashboardService);
    });
    describe('getVendorProfile', () => {
        it('should throw PROFILE_NOT_FOUND when vendor profile does not exist', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(null);
            await expect(service.getVendorProfile('VND999999')).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should return profile when exists', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
            const res = await service.getVendorProfile('VND100001');
            expect(res.id).toBe('profile-uuid-1');
        });
    });
    describe('getAnalytics', () => {
        it('should aggregate views, enquiries, ratings, and products count', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.vendorStoreView.count.mockResolvedValue(1420);
            mockPrismaService.vendorEnquiry.count.mockResolvedValue(85);
            mockPrismaService.vendorRating.count.mockResolvedValue(42);
            mockPrismaService.jewelleryShowcase.count.mockResolvedValue(15);
            const res = await service.getAnalytics('VND100001');
            expect(res).toEqual({
                totalStoreViews: 1420,
                totalEnquiries: 85,
                totalRatings: 42,
                totalProductsListed: 15,
            });
        });
    });
    describe('getViewsGraph', () => {
        beforeEach(() => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
        });
        it('should generate 24 hourly intervals for DAY period', async () => {
            mockPrismaService.vendorStoreView.findMany.mockResolvedValue([]);
            const res = await service.getViewsGraph('VND100001', vendor_dashboard_dto_1.DashboardPeriod.DAY);
            expect(res.period).toBe(vendor_dashboard_dto_1.DashboardPeriod.DAY);
            expect(res.points).toHaveLength(24);
            expect(res.points[0].label).toBe('00:00');
            expect(res.points[23].label).toBe('23:00');
            expect(res.total).toBe(0);
        });
        it('should generate 7 daily intervals for WEEK period with counts populated', async () => {
            const now = new Date();
            mockPrismaService.vendorStoreView.findMany.mockResolvedValue([
                { createdAt: now },
                { createdAt: now },
            ]);
            const res = await service.getViewsGraph('VND100001', vendor_dashboard_dto_1.DashboardPeriod.WEEK);
            expect(res.period).toBe(vendor_dashboard_dto_1.DashboardPeriod.WEEK);
            expect(res.points).toHaveLength(7);
            expect(res.total).toBe(2);
        });
        it('should generate 12 monthly intervals for YEAR period', async () => {
            mockPrismaService.vendorStoreView.findMany.mockResolvedValue([]);
            const res = await service.getViewsGraph('VND100001', vendor_dashboard_dto_1.DashboardPeriod.YEAR);
            expect(res.period).toBe(vendor_dashboard_dto_1.DashboardPeriod.YEAR);
            expect(res.points).toHaveLength(12);
            expect(res.points[0].label).toBe('Jan');
            expect(res.points[11].label).toBe('Dec');
        });
    });
    describe('getEnquiriesGraph', () => {
        beforeEach(() => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
        });
        it('should return enquiries graph for month with daily buckets', async () => {
            mockPrismaService.vendorEnquiry.findMany.mockResolvedValue([]);
            const res = await service.getEnquiriesGraph('VND100001', vendor_dashboard_dto_1.DashboardPeriod.MONTH);
            expect(res.period).toBe(vendor_dashboard_dto_1.DashboardPeriod.MONTH);
            expect(res.points.length).toBeGreaterThanOrEqual(28);
            expect(res.points[0].label).toBe('1');
        });
    });
    describe('getEnquiries', () => {
        it('should return paginated enquiries with customer and product information', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.vendorEnquiry.count.mockResolvedValue(1);
            mockPrismaService.vendorEnquiry.findMany.mockResolvedValue([
                {
                    id: 'enq-uuid-1',
                    enquiryId: 'ENQ100001',
                    message: 'Is this available in size 18?',
                    customerName: 'Pooja Verma',
                    customerMobile: '9876543210',
                    customerProfileImage: 'https://s3.example.com/pooja.jpg',
                    jewellery: {
                        id: 'item-uuid-1',
                        title: 'Gold Ring',
                        imageUrl: 'https://s3.example.com/ring.jpg',
                        price: 25000,
                    },
                    createdAt: new Date('2026-09-27T14:30:00.000Z'),
                },
            ]);
            const res = await service.getEnquiries('VND100001', 1, 10);
            expect(res.pagination.totalRecords).toBe(1);
            expect(res.pagination.totalPages).toBe(1);
            expect(res.enquiries).toHaveLength(1);
            expect(res.enquiries[0].enquiryId).toBe('ENQ100001');
            expect(res.enquiries[0].customer.name).toBe('Pooja Verma');
            expect(res.enquiries[0].product?.title).toBe('Gold Ring');
            expect(res.enquiries[0].date).toBe('2026-09-27');
        });
    });
    describe('getRatings', () => {
        it('should return paginated ratings list', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.vendorRating.count.mockResolvedValue(1);
            mockPrismaService.vendorRating.findMany.mockResolvedValue([
                {
                    id: 'rating-uuid-1',
                    rating: 5,
                    review: 'Outstanding quality and fast delivery!',
                    customerName: 'Aman Jain',
                    customerProfileImage: null,
                    createdAt: new Date('2026-09-27T15:00:00.000Z'),
                },
            ]);
            const res = await service.getRatings('VND100001', 1, 10);
            expect(res.pagination.totalRecords).toBe(1);
            expect(res.ratings).toHaveLength(1);
            expect(res.ratings[0].rating).toBe(5);
            expect(res.ratings[0].review).toBe('Outstanding quality and fast delivery!');
            expect(res.ratings[0].customerName).toBe('Aman Jain');
        });
    });
    describe('getRatingSummary', () => {
        it('should compute average rating and star breakdown percentages', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.vendorRating.count.mockResolvedValue(10);
            mockPrismaService.vendorRating.groupBy.mockResolvedValue([
                { rating: 5, _count: { rating: 6 } },
                { rating: 4, _count: { rating: 3 } },
                { rating: 3, _count: { rating: 1 } },
            ]);
            const res = await service.getRatingSummary('VND100001');
            expect(res.totalRatings).toBe(10);
            expect(res.averageRating).toBe(4.5);
            expect(res.distribution['5'].count).toBe(6);
            expect(res.distribution['5'].percentage).toBe(60);
            expect(res.distribution['4'].count).toBe(3);
            expect(res.distribution['4'].percentage).toBe(30);
            expect(res.distribution['3'].count).toBe(1);
            expect(res.distribution['3'].percentage).toBe(10);
            expect(res.distribution['2'].count).toBe(0);
            expect(res.distribution['1'].count).toBe(0);
        });
        it('should handle zero ratings without division by zero', async () => {
            mockPrismaService.vendorProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.vendorRating.count.mockResolvedValue(0);
            mockPrismaService.vendorRating.groupBy.mockResolvedValue([]);
            const res = await service.getRatingSummary('VND100001');
            expect(res.totalRatings).toBe(0);
            expect(res.averageRating).toBe(0);
            expect(res.distribution['5'].count).toBe(0);
            expect(res.distribution['5'].percentage).toBe(0);
        });
    });
});
//# sourceMappingURL=vendor-dashboard.service.spec.js.map