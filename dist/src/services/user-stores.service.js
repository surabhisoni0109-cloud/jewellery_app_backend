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
exports.UserStoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const user_stores_dto_1 = require("../dto/user-stores.dto");
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
        return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
function isStoreCurrentlyOpen(openingTime, closingTime) {
    if (!openingTime || !closingTime)
        return false;
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    return currentTime >= openingTime && currentTime <= closingTime;
}
let UserStoresService = class UserStoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveStore(storeId) {
        const store = await this.prisma.vendorProfile.findFirst({
            where: {
                OR: [{ id: storeId }, { userId: storeId }],
                isOnboarded: true,
            },
        });
        if (!store) {
            throw new custom_exception_1.CustomException('Store not found or onboarding not completed', 'PROFILE_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return store;
    }
    async getStores(query, userId) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        let userLat = query.latitude;
        let userLng = query.longitude;
        let preferredCity = query.city;
        if (userId && (userLat == null || userLng == null || !preferredCity)) {
            try {
                const userProfile = await this.prisma.userProfile.findUnique({
                    where: { userId },
                });
                const userLoc = userProfile?.location || null;
                if (userLoc) {
                    if (userLat == null && userLoc.latitude != null) {
                        userLat = Number(userLoc.latitude);
                    }
                    if (userLng == null && userLoc.longitude != null) {
                        userLng = Number(userLoc.longitude);
                    }
                    if (!preferredCity && userLoc.city) {
                        preferredCity = String(userLoc.city);
                    }
                }
            }
            catch {
            }
        }
        const stores = await this.prisma.vendorProfile.findMany({
            where: {
                isOnboarded: true,
            },
            include: {
                ratings: {
                    select: { rating: true },
                },
            },
        });
        let favoriteStoreIds = new Set();
        if (userId) {
            try {
                const favs = await this.prisma.userFavoriteStore.findMany({
                    where: { userId },
                    select: { vendorProfileId: true },
                });
                favoriteStoreIds = new Set(favs.map((f) => f.vendorProfileId));
            }
            catch {
            }
        }
        let items = stores.map((store) => {
            const loc = store.storeLocation || {};
            const distanceKm = calculateDistanceKm(userLat, userLng, loc.latitude != null ? Number(loc.latitude) : null, loc.longitude != null ? Number(loc.longitude) : null);
            const totalReviews = store.ratings.length;
            const averageRating = totalReviews > 0
                ? Math.round((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalReviews) *
                    10) / 10
                : 0;
            const isOpen = isStoreCurrentlyOpen(store.storeOpeningTime, store.storeClosingTime);
            return {
                id: store.id,
                userId: store.userId,
                storeName: store.storeName || '',
                storeDescription: store.storeDescription,
                storeLogo: store.storeLogo,
                storeCoverImage: store.storeCoverImages?.[0] || null,
                location: store.storeLocation,
                distanceKm,
                averageRating,
                totalReviews,
                jewelleryStartingPrice: store.jewelleryStartingPrice
                    ? Number(store.jewelleryStartingPrice)
                    : null,
                isOpen,
                isFavorite: favoriteStoreIds.has(store.id),
                storeOpeningTime: store.storeOpeningTime,
                storeClosingTime: store.storeClosingTime,
                createdAt: store.createdAt,
            };
        });
        if (query.city) {
            const cityFilter = query.city.toLowerCase().trim();
            items = items.filter((item) => {
                const city = item.location?.city?.toLowerCase() || '';
                return city.includes(cityFilter);
            });
        }
        if (query.state) {
            const stateFilter = query.state.toLowerCase().trim();
            items = items.filter((item) => {
                const st = item.location?.state?.toLowerCase() || '';
                return st.includes(stateFilter);
            });
        }
        if (query.pincode) {
            const pinFilter = query.pincode.trim();
            items = items.filter((item) => {
                const pin = String(item.location?.pincode || '');
                return pin.includes(pinFilter);
            });
        }
        if (query.search) {
            const s = query.search.toLowerCase().trim();
            items = items.filter((item) => {
                const id = item.id.toLowerCase();
                const vendorId = item.userId.toLowerCase();
                const name = item.storeName.toLowerCase();
                const desc = (item.storeDescription || '').toLowerCase();
                const area = (item.location?.area || '').toLowerCase();
                const city = (item.location?.city || '').toLowerCase();
                const pincode = String(item.location?.pincode || '').toLowerCase();
                return (id.includes(s) ||
                    vendorId.includes(s) ||
                    name.includes(s) ||
                    desc.includes(s) ||
                    area.includes(s) ||
                    city.includes(s) ||
                    pincode.includes(s));
            });
        }
        const sortBy = query.sortBy ||
            (userLat != null && userLng != null ? user_stores_dto_1.StoreSortBy.DISTANCE : user_stores_dto_1.StoreSortBy.RATING);
        if (sortBy === user_stores_dto_1.StoreSortBy.DISTANCE) {
            items.sort((a, b) => {
                if (a.distanceKm == null && b.distanceKm == null) {
                    if (preferredCity) {
                        const aCity = (a.location?.city || '').toLowerCase();
                        const bCity = (b.location?.city || '').toLowerCase();
                        const targetCity = preferredCity.toLowerCase();
                        if (aCity.includes(targetCity) && !bCity.includes(targetCity))
                            return -1;
                        if (!aCity.includes(targetCity) && bCity.includes(targetCity))
                            return 1;
                    }
                    return b.averageRating - a.averageRating;
                }
                if (a.distanceKm == null)
                    return 1;
                if (b.distanceKm == null)
                    return -1;
                return a.distanceKm - b.distanceKm;
            });
        }
        else if (sortBy === user_stores_dto_1.StoreSortBy.RATING) {
            items.sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews);
        }
        else if (sortBy === user_stores_dto_1.StoreSortBy.PRICE) {
            items.sort((a, b) => {
                const pa = a.jewelleryStartingPrice ?? Number.MAX_SAFE_INTEGER;
                const pb = b.jewelleryStartingPrice ?? Number.MAX_SAFE_INTEGER;
                return pa - pb;
            });
        }
        else if (sortBy === user_stores_dto_1.StoreSortBy.NEWEST) {
            items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        const total = items.length;
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);
        return {
            items: paginatedItems,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async getStoreDetails(storeId, viewerUserId) {
        const store = await this.resolveStore(storeId);
        let userLat;
        let userLng;
        if (viewerUserId) {
            this.prisma.vendorStoreView
                .create({
                data: {
                    vendorProfileId: store.id,
                    viewerUserId,
                },
            })
                .catch(() => { });
            try {
                const viewerProfile = await this.prisma.userProfile.findUnique({
                    where: { userId: viewerUserId },
                });
                const loc = viewerProfile?.location || null;
                if (loc && loc.latitude != null && loc.longitude != null) {
                    userLat = Number(loc.latitude);
                    userLng = Number(loc.longitude);
                }
            }
            catch {
            }
        }
        const ratings = await this.prisma.vendorRating.findMany({
            where: { vendorProfileId: store.id },
            select: { rating: true },
        });
        const totalReviews = ratings.length;
        const averageRating = totalReviews > 0
            ? Math.round((ratings.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
            : 0;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of ratings) {
            if (r.rating >= 1 && r.rating <= 5) {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            }
        }
        const loc = store.storeLocation || {};
        const distanceKm = calculateDistanceKm(userLat, userLng, loc.latitude != null ? Number(loc.latitude) : null, loc.longitude != null ? Number(loc.longitude) : null);
        const isOpen = isStoreCurrentlyOpen(store.storeOpeningTime, store.storeClosingTime);
        let isFavorite = false;
        if (viewerUserId) {
            try {
                const fav = await this.prisma.userFavoriteStore.findUnique({
                    where: {
                        userId_vendorProfileId: {
                            userId: viewerUserId,
                            vendorProfileId: store.id,
                        },
                    },
                });
                isFavorite = !!fav;
            }
            catch {
            }
        }
        return {
            id: store.id,
            userId: store.userId,
            storeName: store.storeName || '',
            storeDescription: store.storeDescription,
            storeLogo: store.storeLogo,
            storeCoverImages: store.storeCoverImages || [],
            location: store.storeLocation ?? null,
            distanceKm,
            jewelleryStartingPrice: store.jewelleryStartingPrice
                ? Number(store.jewelleryStartingPrice)
                : null,
            storeWebsite: store.storeWebsite,
            storeContactNumber: store.storeContactNumber,
            storeOwnerName: store.storeOwnerName ?? null,
            whatsappNumber: store.whatsappNumber ?? null,
            storeEmail: store.storeEmail,
            storeOpeningTime: store.storeOpeningTime,
            storeClosingTime: store.storeClosingTime,
            storeFoundedYear: store.storeFoundedYear,
            isOpen,
            isFavorite,
            ratingSummary: {
                averageRating,
                totalReviews,
                distribution,
            },
        };
    }
    async getStoreJewellery(storeId, query) {
        const store = await this.resolveStore(storeId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = {
            vendorProfileId: store.id,
            isPublished: true,
        };
        if (query.jewelleryType) {
            where.jewelleryType = { contains: query.jewelleryType, mode: 'insensitive' };
        }
        if (query.gender) {
            where.gender = { equals: query.gender, mode: 'insensitive' };
        }
        if (query.hasDiscount !== undefined) {
            where.hasDiscount = query.hasDiscount;
        }
        if (query.hasSpecialOccasion !== undefined) {
            where.hasSpecialOccasion = query.hasSpecialOccasion;
        }
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [total, items] = await Promise.all([
            this.prisma.jewelleryShowcase.count({ where }),
            this.prisma.jewelleryShowcase.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            items: items.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                price: Number(item.price),
                imageUrl: item.imageUrl,
                images: item.images?.length ? item.images : [item.imageUrl],
                jewelleryType: item.jewelleryType,
                weight: item.weight,
                purity: item.purity,
                gender: item.gender,
                hasDiscount: item.hasDiscount,
                discountPercentage: item.discountPercentage ? Number(item.discountPercentage) : null,
                discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
                hasSpecialOccasion: item.hasSpecialOccasion,
                specialOccasionName: item.specialOccasionName,
                specialOccasionDate: item.specialOccasionDate?.toISOString().split('T')[0] ?? null,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async getStoreRatings(storeId, query) {
        const store = await this.resolveStore(storeId);
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const allRatings = await this.prisma.vendorRating.findMany({
            where: { vendorProfileId: store.id },
            select: { rating: true },
        });
        const totalReviews = allRatings.length;
        const averageRating = totalReviews > 0
            ? Math.round((allRatings.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
            : 0;
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of allRatings) {
            if (r.rating >= 1 && r.rating <= 5) {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            }
        }
        const where = {
            vendorProfileId: store.id,
            ...(query.rating !== undefined && { rating: query.rating }),
        };
        const [filteredTotal, reviews] = await Promise.all([
            this.prisma.vendorRating.count({ where }),
            this.prisma.vendorRating.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            summary: {
                averageRating,
                totalReviews,
                distribution,
            },
            reviews: reviews.map((r) => ({
                id: r.id,
                customerId: r.customerId,
                customerName: r.customerName,
                customerProfileImage: r.customerProfileImage,
                rating: r.rating,
                review: r.review,
                createdAt: r.createdAt.toISOString(),
            })),
            pagination: {
                total: filteredTotal,
                page,
                limit,
                totalPages: Math.ceil(filteredTotal / limit) || 1,
            },
        };
    }
    async createOrUpdateRating(userId, storeId, dto) {
        const store = await this.resolveStore(storeId);
        const [user, userProfile] = await Promise.all([
            this.prisma.user.findUnique({ where: { userId } }),
            this.prisma.userProfile.findUnique({ where: { userId } }),
        ]);
        if (!user) {
            throw new custom_exception_1.CustomException('User not found', 'USER_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const customerName = `${user.firstName} ${user.lastName}`.trim() || 'Anonymous User';
        const customerProfileImage = userProfile?.profilePicture || null;
        const existing = await this.prisma.vendorRating.findFirst({
            where: {
                vendorProfileId: store.id,
                customerId: user.userId,
            },
        });
        if (existing) {
            const updated = await this.prisma.vendorRating.update({
                where: { id: existing.id },
                data: {
                    rating: dto.rating,
                    review: dto.review ?? existing.review,
                    customerName,
                    customerProfileImage,
                },
            });
            return {
                message: 'Review updated successfully',
                rating: updated,
            };
        }
        const created = await this.prisma.vendorRating.create({
            data: {
                vendorProfileId: store.id,
                customerId: user.userId,
                customerName,
                customerProfileImage,
                rating: dto.rating,
                review: dto.review || null,
            },
        });
        return {
            message: 'Review submitted successfully',
            rating: created,
        };
    }
    async createEnquiry(userId, storeId, dto) {
        const store = await this.resolveStore(storeId);
        const [user, userProfile] = await Promise.all([
            this.prisma.user.findUnique({ where: { userId } }),
            this.prisma.userProfile.findUnique({ where: { userId } }),
        ]);
        if (!user) {
            throw new custom_exception_1.CustomException('User not found', 'USER_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        if (dto.jewelleryId) {
            const jewellery = await this.prisma.jewelleryShowcase.findFirst({
                where: { id: dto.jewelleryId, vendorProfileId: store.id },
            });
            if (!jewellery) {
                throw new custom_exception_1.CustomException('Jewellery item not found in this store', 'SHOWCASE_ITEM_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
            }
        }
        const customerName = `${user.firstName} ${user.lastName}`.trim() || 'Customer';
        const customerMobile = user.mobileNumber;
        const customerProfileImage = userProfile?.profilePicture || null;
        const count = await this.prisma.vendorEnquiry.count();
        const enquiryId = `ENQ${100001 + count}`;
        const enquiry = await this.prisma.vendorEnquiry.create({
            data: {
                enquiryId,
                vendorProfileId: store.id,
                customerId: user.userId,
                customerName,
                customerMobile,
                customerProfileImage,
                message: dto.message,
                jewelleryId: dto.jewelleryId || null,
            },
        });
        await this.prisma.notification
            .create({
            data: {
                userId: store.userId,
                title: 'New Customer Enquiry',
                body: `${customerName} sent an enquiry: "${dto.message.slice(0, 60)}"`,
                data: {
                    screen: 'EnquiryDetails',
                    enquiryId,
                    customerId: user.userId,
                },
            },
        })
            .catch(() => { });
        return {
            enquiryId: enquiry.enquiryId,
            customerName: enquiry.customerName,
            message: enquiry.message,
            jewelleryId: enquiry.jewelleryId,
            createdAt: enquiry.createdAt,
        };
    }
    async toggleFavorite(userId, storeId) {
        const store = await this.resolveStore(storeId);
        const existing = await this.prisma.userFavoriteStore.findUnique({
            where: {
                userId_vendorProfileId: {
                    userId,
                    vendorProfileId: store.id,
                },
            },
        });
        if (existing) {
            await this.prisma.userFavoriteStore.delete({
                where: { id: existing.id },
            });
            return {
                isFavorite: false,
                message: 'Store removed from favorites',
            };
        }
        else {
            await this.prisma.userFavoriteStore.create({
                data: {
                    userId,
                    vendorProfileId: store.id,
                },
            });
            return {
                isFavorite: true,
                message: 'Store added to favorites',
            };
        }
    }
    async getFavoriteStores(userId, query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        let userLat = query.latitude;
        let userLng = query.longitude;
        if (userLat == null || userLng == null) {
            try {
                const userProfile = await this.prisma.userProfile.findUnique({
                    where: { userId },
                });
                const userLoc = userProfile?.location || null;
                if (userLoc) {
                    if (userLat == null && userLoc.latitude != null) {
                        userLat = Number(userLoc.latitude);
                    }
                    if (userLng == null && userLoc.longitude != null) {
                        userLng = Number(userLoc.longitude);
                    }
                }
            }
            catch {
            }
        }
        const favorites = await this.prisma.userFavoriteStore.findMany({
            where: { userId },
            include: {
                vendorProfile: {
                    include: {
                        ratings: { select: { rating: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const items = favorites
            .filter((fav) => fav.vendorProfile && fav.vendorProfile.isOnboarded)
            .map((fav) => {
            const store = fav.vendorProfile;
            const loc = store.storeLocation || {};
            const distanceKm = calculateDistanceKm(userLat, userLng, loc.latitude != null ? Number(loc.latitude) : null, loc.longitude != null ? Number(loc.longitude) : null);
            const totalReviews = store.ratings?.length || 0;
            const averageRating = totalReviews > 0
                ? Math.round((store.ratings.reduce((acc, r) => acc + r.rating, 0) /
                    totalReviews) *
                    10) / 10
                : 0;
            const isOpen = isStoreCurrentlyOpen(store.storeOpeningTime, store.storeClosingTime);
            return {
                id: store.id,
                userId: store.userId,
                storeName: store.storeName || '',
                storeDescription: store.storeDescription,
                storeLogo: store.storeLogo,
                storeCoverImage: store.storeCoverImages?.[0] || null,
                location: store.storeLocation,
                distanceKm,
                averageRating,
                totalReviews,
                jewelleryStartingPrice: store.jewelleryStartingPrice
                    ? Number(store.jewelleryStartingPrice)
                    : null,
                isOpen,
                isFavorite: true,
                storeOpeningTime: store.storeOpeningTime,
                storeClosingTime: store.storeClosingTime,
                favoritedAt: fav.createdAt,
            };
        });
        const total = items.length;
        const startIndex = (page - 1) * limit;
        const paginatedItems = items.slice(startIndex, startIndex + limit);
        return {
            items: paginatedItems,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
};
exports.UserStoresService = UserStoresService;
exports.UserStoresService = UserStoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserStoresService);
//# sourceMappingURL=user-stores.service.js.map