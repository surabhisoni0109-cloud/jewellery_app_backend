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
exports.VendorDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const vendor_dashboard_dto_1 = require("../dto/vendor-dashboard.dto");
let VendorDashboardService = class VendorDashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getVendorProfile(userId) {
        const profile = await this.prisma.vendorProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new custom_exception_1.CustomException('Vendor profile not found. Please complete personal info step.', 'PROFILE_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return profile;
    }
    async getAnalytics(userId) {
        const profile = await this.getVendorProfile(userId);
        const [totalStoreViews, totalEnquiries, totalRatings, totalProductsListed] = await Promise.all([
            this.prisma.vendorStoreView.count({
                where: { vendorProfileId: profile.id },
            }),
            this.prisma.vendorEnquiry.count({
                where: { vendorProfileId: profile.id },
            }),
            this.prisma.vendorRating.count({
                where: { vendorProfileId: profile.id },
            }),
            this.prisma.jewelleryShowcase.count({
                where: { vendorProfileId: profile.id },
            }),
        ]);
        return {
            totalStoreViews,
            totalEnquiries,
            totalRatings,
            totalProductsListed,
        };
    }
    async getViewsGraph(userId, period = vendor_dashboard_dto_1.DashboardPeriod.WEEK) {
        const profile = await this.getVendorProfile(userId);
        const { startDate, endDate, buckets, resolveBucketKey } = this.buildTimeBuckets(period);
        const views = await this.prisma.vendorStoreView.findMany({
            where: {
                vendorProfileId: profile.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { createdAt: true },
        });
        const bucketMap = new Map();
        for (const b of buckets) {
            bucketMap.set(b.key, 0);
        }
        for (const v of views) {
            const key = resolveBucketKey(v.createdAt);
            if (bucketMap.has(key)) {
                bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
            }
        }
        const points = buckets.map((b) => ({
            label: b.label,
            date: b.date,
            count: bucketMap.get(b.key) || 0,
        }));
        const total = points.reduce((sum, p) => sum + p.count, 0);
        return {
            period,
            total,
            points,
        };
    }
    async getEnquiriesGraph(userId, period = vendor_dashboard_dto_1.DashboardPeriod.WEEK) {
        const profile = await this.getVendorProfile(userId);
        const { startDate, endDate, buckets, resolveBucketKey } = this.buildTimeBuckets(period);
        const enquiries = await this.prisma.vendorEnquiry.findMany({
            where: {
                vendorProfileId: profile.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { createdAt: true },
        });
        const bucketMap = new Map();
        for (const b of buckets) {
            bucketMap.set(b.key, 0);
        }
        for (const e of enquiries) {
            const key = resolveBucketKey(e.createdAt);
            if (bucketMap.has(key)) {
                bucketMap.set(key, (bucketMap.get(key) || 0) + 1);
            }
        }
        const points = buckets.map((b) => ({
            label: b.label,
            date: b.date,
            count: bucketMap.get(b.key) || 0,
        }));
        const total = points.reduce((sum, p) => sum + p.count, 0);
        return {
            period,
            total,
            points,
        };
    }
    async getEnquiries(userId, page = 1, limit = 10) {
        const profile = await this.getVendorProfile(userId);
        const skip = (page - 1) * limit;
        const [totalRecords, records] = await Promise.all([
            this.prisma.vendorEnquiry.count({
                where: { vendorProfileId: profile.id },
            }),
            this.prisma.vendorEnquiry.findMany({
                where: { vendorProfileId: profile.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    jewellery: {
                        select: {
                            id: true,
                            title: true,
                            imageUrl: true,
                            price: true,
                        },
                    },
                },
            }),
        ]);
        const enquiries = records.map((e) => ({
            enquiryId: e.enquiryId,
            message: e.message,
            customer: {
                name: e.customerName,
                mobileNumber: e.customerMobile,
                profileImage: e.customerProfileImage,
            },
            product: e.jewellery
                ? {
                    id: e.jewellery.id,
                    title: e.jewellery.title,
                    imageUrl: e.jewellery.imageUrl,
                    price: e.jewellery.price.toString(),
                }
                : null,
            date: this.formatDate(e.createdAt),
            time: this.formatTime(e.createdAt),
            createdAt: e.createdAt,
        }));
        const totalPages = Math.ceil(totalRecords / limit) || 1;
        return {
            enquiries,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages,
            },
        };
    }
    async getRatings(userId, page = 1, limit = 10) {
        const profile = await this.getVendorProfile(userId);
        const skip = (page - 1) * limit;
        const [totalRecords, records] = await Promise.all([
            this.prisma.vendorRating.count({
                where: { vendorProfileId: profile.id },
            }),
            this.prisma.vendorRating.findMany({
                where: { vendorProfileId: profile.id },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);
        const ratings = records.map((r) => ({
            id: r.id,
            rating: r.rating,
            review: r.review,
            customerName: r.customerName,
            customerProfileImage: r.customerProfileImage,
            date: this.formatDate(r.createdAt),
            time: this.formatTime(r.createdAt),
            createdAt: r.createdAt,
        }));
        const totalPages = Math.ceil(totalRecords / limit) || 1;
        return {
            ratings,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages,
            },
        };
    }
    async getRatingSummary(userId) {
        const profile = await this.getVendorProfile(userId);
        const [totalRatings, grouped] = await Promise.all([
            this.prisma.vendorRating.count({
                where: { vendorProfileId: profile.id },
            }),
            this.prisma.vendorRating.groupBy({
                by: ['rating'],
                where: { vendorProfileId: profile.id },
                _count: { rating: true },
            }),
        ]);
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sumStars = 0;
        for (const g of grouped) {
            if (counts[g.rating] !== undefined) {
                counts[g.rating] = g._count.rating;
                sumStars += g.rating * g._count.rating;
            }
        }
        const averageRating = totalRatings > 0 ? Number((sumStars / totalRatings).toFixed(1)) : 0;
        const calcPercentage = (count) => totalRatings > 0 ? Number(((count / totalRatings) * 100).toFixed(1)) : 0;
        return {
            totalRatings,
            averageRating,
            distribution: {
                '5': { count: counts[5], percentage: calcPercentage(counts[5]) },
                '4': { count: counts[4], percentage: calcPercentage(counts[4]) },
                '3': { count: counts[3], percentage: calcPercentage(counts[3]) },
                '2': { count: counts[2], percentage: calcPercentage(counts[2]) },
                '1': { count: counts[1], percentage: calcPercentage(counts[1]) },
            },
        };
    }
    buildTimeBuckets(period) {
        const now = new Date();
        if (period === vendor_dashboard_dto_1.DashboardPeriod.DAY) {
            const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const buckets = [];
            for (let hour = 0; hour < 24; hour++) {
                const hh = hour.toString().padStart(2, '0') + ':00';
                buckets.push({ key: hh, label: hh });
            }
            return {
                startDate,
                endDate,
                buckets,
                resolveBucketKey: (d) => d.getHours().toString().padStart(2, '0') + ':00',
            };
        }
        if (period === vendor_dashboard_dto_1.DashboardPeriod.WEEK) {
            const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const buckets = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const yyyyMmDd = this.formatDate(d);
                const label = dayNames[d.getDay()];
                buckets.push({ key: yyyyMmDd, label, date: yyyyMmDd });
            }
            return {
                startDate,
                endDate,
                buckets,
                resolveBucketKey: (d) => this.formatDate(d),
            };
        }
        if (period === vendor_dashboard_dto_1.DashboardPeriod.MONTH) {
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const endDate = new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59, 999);
            const buckets = [];
            for (let day = 1; day <= lastDay; day++) {
                const d = new Date(now.getFullYear(), now.getMonth(), day);
                const yyyyMmDd = this.formatDate(d);
                buckets.push({ key: yyyyMmDd, label: day.toString(), date: yyyyMmDd });
            }
            return {
                startDate,
                endDate,
                buckets,
                resolveBucketKey: (d) => this.formatDate(d),
            };
        }
        const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const buckets = [];
        for (let m = 0; m < 12; m++) {
            buckets.push({ key: m.toString(), label: monthNames[m] });
        }
        return {
            startDate,
            endDate,
            buckets,
            resolveBucketKey: (d) => d.getMonth().toString(),
        };
    }
    formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    formatTime(date) {
        const hh = date.getHours().toString().padStart(2, '0');
        const mm = date.getMinutes().toString().padStart(2, '0');
        const ss = date.getSeconds().toString().padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }
};
exports.VendorDashboardService = VendorDashboardService;
exports.VendorDashboardService = VendorDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorDashboardService);
//# sourceMappingURL=vendor-dashboard.service.js.map