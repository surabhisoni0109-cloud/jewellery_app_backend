import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CustomException } from '../common/exceptions/custom-exception';
import {
  StoreQueryDto,
  StoreSortBy,
  StoreDetailsDto,
  StoreJewelleryQueryDto,
  StoreRatingsQueryDto,
  CreateStoreRatingDto,
  CreateStoreEnquiryDto,
} from '../dto/user-stores.dto';

function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null,
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function isStoreCurrentlyOpen(
  openingTime?: string | null,
  closingTime?: string | null,
): boolean {
  if (!openingTime || !closingTime) return false;
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  return currentTime >= openingTime && currentTime <= closingTime;
}

@Injectable()
export class UserStoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to find a store by its UUID or public userId (e.g. VND100001).
   */
  async resolveStore(storeId: string) {
    const store = await this.prisma.vendorProfile.findFirst({
      where: {
        OR: [{ id: storeId }, { userId: storeId }],
        isOnboarded: true,
      },
    });

    if (!store) {
      throw new CustomException(
        'Store not found or onboarding not completed',
        'PROFILE_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return store;
  }

  /**
   * GET /api/user/stores
   * Discovers and lists jewellery shops. If user is logged in, automatically uses
   * their saved profile location to rank nearby stores first (like Zomato/Swiggy).
   */
  async getStores(query: StoreQueryDto, userId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    let userLat = query.latitude;
    let userLng = query.longitude;
    let preferredCity = query.city;

    // If user is authenticated and hasn't explicitly supplied coordinates/city,
    // automatically retrieve location from UserProfile (like big apps)
    if (userId && (userLat == null || userLng == null || !preferredCity)) {
      try {
        const userProfile = await this.prisma.userProfile.findUnique({
          where: { userId },
        });
        const userLoc = (userProfile?.location as any) || null;
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
      } catch {
        // Fallback gracefully if profile fetch fails
      }
    }

    // Fetch all active, onboarded vendor profiles with their ratings
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

    // Transform and calculate distance & rating for each store
    let items = stores.map((store) => {
      const loc = (store.storeLocation as any) || {};
      const distanceKm = calculateDistanceKm(
        userLat,
        userLng,
        loc.latitude != null ? Number(loc.latitude) : null,
        loc.longitude != null ? Number(loc.longitude) : null,
      );

      const totalReviews = store.ratings.length;
      const averageRating =
        totalReviews > 0
          ? Math.round(
              (store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalReviews) *
                10,
            ) / 10
          : 0;

      const isOpen = isStoreCurrentlyOpen(
        store.storeOpeningTime,
        store.storeClosingTime,
      );

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
        storeOpeningTime: store.storeOpeningTime,
        storeClosingTime: store.storeClosingTime,
        createdAt: store.createdAt,
      };
    });

    // In-memory filtering for location JSON and search
    // If query explicitly provided a city, filter strictly by that city
    if (query.city) {
      const cityFilter = query.city.toLowerCase().trim();
      items = items.filter((item) => {
        const city = (item.location as any)?.city?.toLowerCase() || '';
        return city.includes(cityFilter);
      });
    }

    if (query.state) {
      const stateFilter = query.state.toLowerCase().trim();
      items = items.filter((item) => {
        const st = (item.location as any)?.state?.toLowerCase() || '';
        return st.includes(stateFilter);
      });
    }

    if (query.pincode) {
      const pinFilter = query.pincode.trim();
      items = items.filter((item) => {
        const pin = String((item.location as any)?.pincode || '');
        return pin.includes(pinFilter);
      });
    }

    // Search by Store UUID (item.id), Vendor ID (item.userId), Store Name, Description, Area, City
    if (query.search) {
      const s = query.search.toLowerCase().trim();
      items = items.filter((item) => {
        const id = item.id.toLowerCase();
        const vendorId = item.userId.toLowerCase();
        const name = item.storeName.toLowerCase();
        const desc = (item.storeDescription || '').toLowerCase();
        const area = ((item.location as any)?.area || '').toLowerCase();
        const city = ((item.location as any)?.city || '').toLowerCase();
        const pincode = String((item.location as any)?.pincode || '').toLowerCase();
        return (
          id.includes(s) ||
          vendorId.includes(s) ||
          name.includes(s) ||
          desc.includes(s) ||
          area.includes(s) ||
          city.includes(s) ||
          pincode.includes(s)
        );
      });
    }

    // Sorting:
    // If coordinates are available, sort by distance ascending (nearest stores first)
    // If not, but preferredCity is known from profile, prioritize stores in the user's city!
    const sortBy =
      query.sortBy ||
      (userLat != null && userLng != null ? StoreSortBy.DISTANCE : StoreSortBy.RATING);

    if (sortBy === StoreSortBy.DISTANCE) {
      items.sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) {
          if (preferredCity) {
            const aCity = ((a.location as any)?.city || '').toLowerCase();
            const bCity = ((b.location as any)?.city || '').toLowerCase();
            const targetCity = preferredCity.toLowerCase();
            if (aCity.includes(targetCity) && !bCity.includes(targetCity)) return -1;
            if (!aCity.includes(targetCity) && bCity.includes(targetCity)) return 1;
          }
          return b.averageRating - a.averageRating;
        }
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === StoreSortBy.RATING) {
      items.sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews);
    } else if (sortBy === StoreSortBy.PRICE) {
      items.sort((a, b) => {
        const pa = a.jewelleryStartingPrice ?? Number.MAX_SAFE_INTEGER;
        const pb = b.jewelleryStartingPrice ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    } else if (sortBy === StoreSortBy.NEWEST) {
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Pagination
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

  /**
   * GET /api/user/stores/:storeId
   * Fetches full store details, calculates rating breakdown, and registers store view.
   * If viewer is logged in, automatically calculates distance from their saved profile location.
   */
  async getStoreDetails(
    storeId: string,
    viewerUserId?: string,
  ): Promise<StoreDetailsDto> {
    const store = await this.resolveStore(storeId);

    // If viewer is logged in, record view and auto-fetch their profile location for distance calculation
    let userLat: number | undefined;
    let userLng: number | undefined;

    if (viewerUserId) {
      this.prisma.vendorStoreView
        .create({
          data: {
            vendorProfileId: store.id,
            viewerUserId,
          },
        })
        .catch(() => {});

      try {
        const viewerProfile = await this.prisma.userProfile.findUnique({
          where: { userId: viewerUserId },
        });
        const loc = (viewerProfile?.location as any) || null;
        if (loc && loc.latitude != null && loc.longitude != null) {
          userLat = Number(loc.latitude);
          userLng = Number(loc.longitude);
        }
      } catch {
        // Fallback gracefully
      }
    }

    // Compute ratings & breakdown
    const ratings = await this.prisma.vendorRating.findMany({
      where: { vendorProfileId: store.id },
      select: { rating: true },
    });

    const totalReviews = ratings.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (ratings.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10,
          ) / 10
        : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      }
    }

    const loc = (store.storeLocation as any) || {};
    const distanceKm = calculateDistanceKm(
      userLat,
      userLng,
      loc.latitude != null ? Number(loc.latitude) : null,
      loc.longitude != null ? Number(loc.longitude) : null,
    );

    const isOpen = isStoreCurrentlyOpen(
      store.storeOpeningTime,
      store.storeClosingTime,
    );

    return {
      id: store.id,
      userId: store.userId,
      storeName: store.storeName || '',
      storeDescription: store.storeDescription,
      storeLogo: store.storeLogo,
      storeCoverImages: store.storeCoverImages || [],
      location: (store.storeLocation as object) ?? null,
      distanceKm,
      jewelleryStartingPrice: store.jewelleryStartingPrice
        ? Number(store.jewelleryStartingPrice)
        : null,
      storeWebsite: store.storeWebsite,
      storeContactNumber: store.storeContactNumber,
      storeOwnerName: (store as any).storeOwnerName ?? null,
      whatsappNumber: (store as any).whatsappNumber ?? null,
      storeEmail: store.storeEmail,
      storeOpeningTime: store.storeOpeningTime,
      storeClosingTime: store.storeClosingTime,
      storeFoundedYear: store.storeFoundedYear,
      isOpen,
      ratingSummary: {
        averageRating,
        totalReviews,
        distribution,
      },
    };
  }

  /**
   * GET /api/user/stores/:storeId/jewellery
   * Fetches published showcase jewellery items for the store with filtering and pagination.
   */
  async getStoreJewellery(storeId: string, query: StoreJewelleryQueryDto) {
    const store = await this.resolveStore(storeId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
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

  /**
   * GET /api/user/stores/:storeId/ratings
   * Returns ratings distribution and paginated review list.
   */
  async getStoreRatings(storeId: string, query: StoreRatingsQueryDto) {
    const store = await this.resolveStore(storeId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // Rating summary
    const allRatings = await this.prisma.vendorRating.findMany({
      where: { vendorProfileId: store.id },
      select: { rating: true },
    });

    const totalReviews = allRatings.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (allRatings.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10,
          ) / 10
        : 0;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allRatings) {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      }
    }

    const where: any = {
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

  /**
   * POST /api/user/stores/:storeId/ratings
   * Allows authenticated customer to rate or update their rating for a store.
   */
  async createOrUpdateRating(
    userId: string,
    storeId: string,
    dto: CreateStoreRatingDto,
  ) {
    const store = await this.resolveStore(storeId);

    const [user, userProfile] = await Promise.all([
      this.prisma.user.findUnique({ where: { userId } }),
      this.prisma.userProfile.findUnique({ where: { userId } }),
    ]);

    if (!user) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const customerName = `${user.firstName} ${user.lastName}`.trim() || 'Anonymous User';
    const customerProfileImage = userProfile?.profilePicture || null;

    // Check if the user already reviewed this store
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

  /**
   * POST /api/user/stores/:storeId/enquiry
   * Submits a customer enquiry for the store or for a specific jewellery item.
   */
  async createEnquiry(
    userId: string,
    storeId: string,
    dto: CreateStoreEnquiryDto,
  ) {
    const store = await this.resolveStore(storeId);

    const [user, userProfile] = await Promise.all([
      this.prisma.user.findUnique({ where: { userId } }),
      this.prisma.userProfile.findUnique({ where: { userId } }),
    ]);

    if (!user) {
      throw new CustomException('User not found', 'USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // Verify jewellery item if specified
    if (dto.jewelleryId) {
      const jewellery = await this.prisma.jewelleryShowcase.findFirst({
        where: { id: dto.jewelleryId, vendorProfileId: store.id },
      });
      if (!jewellery) {
        throw new CustomException(
          'Jewellery item not found in this store',
          'SHOWCASE_ITEM_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const customerName = `${user.firstName} ${user.lastName}`.trim() || 'Customer';
    const customerMobile = user.mobileNumber;
    const customerProfileImage = userProfile?.profilePicture || null;

    // Generate unique enquiryId
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

    // Create in-app notification for vendor
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
      .catch(() => {});

    return {
      enquiryId: enquiry.enquiryId,
      customerName: enquiry.customerName,
      message: enquiry.message,
      jewelleryId: enquiry.jewelleryId,
      createdAt: enquiry.createdAt,
    };
  }
}
