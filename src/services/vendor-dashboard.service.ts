import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CustomException } from '../common/exceptions/custom-exception';
import {
  DashboardPeriod,
  DashboardAnalyticsResponseDto,
  DashboardGraphResponseDto,
  EnquiriesListResponseDto,
  RatingsListResponseDto,
  RatingSummaryResponseDto,
} from '../dto/vendor-dashboard.dto';

@Injectable()
export class VendorDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches the VendorProfile for the given vendor userId.
   */
  public async getVendorProfile(userId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new CustomException(
        'Vendor profile not found. Please complete personal info step.',
        'PROFILE_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return profile;
  }

  /**
   * 1.1 Dashboard Analytics Summary
   * Returns total store views, total enquiries, total ratings, and total listed products.
   */
  async getAnalytics(userId: string): Promise<DashboardAnalyticsResponseDto> {
    const profile = await this.getVendorProfile(userId);

    const [totalStoreViews, totalEnquiries, totalRatings, totalProductsListed] =
      await Promise.all([
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

  /**
   * 1.2 User Views Graph
   * Returns time series graph data points for store views according to period.
   */
  async getViewsGraph(
    userId: string,
    period: DashboardPeriod = DashboardPeriod.WEEK,
  ): Promise<DashboardGraphResponseDto> {
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

    const bucketMap = new Map<string, number>();
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

  /**
   * 1.3 Enquiries Graph
   * Returns time series graph data points for customer enquiries according to period.
   */
  async getEnquiriesGraph(
    userId: string,
    period: DashboardPeriod = DashboardPeriod.WEEK,
  ): Promise<DashboardGraphResponseDto> {
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

    const bucketMap = new Map<string, number>();
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

  /**
   * 1.4 Enquiry List
   * Returns paginated list of customer enquiries (latest first) with product details.
   */
  async getEnquiries(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<EnquiriesListResponseDto> {
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

  /**
   * 1.5 Ratings List
   * Returns paginated list of ratings and customer reviews (latest first).
   */
  async getRatings(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<RatingsListResponseDto> {
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

  /**
   * 1.6 Rating Summary
   * Returns overall rating count, average rating, and 1 to 5 star breakdown distribution.
   */
  async getRatingSummary(userId: string): Promise<RatingSummaryResponseDto> {
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

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumStars = 0;

    for (const g of grouped) {
      if (counts[g.rating] !== undefined) {
        counts[g.rating] = g._count.rating;
        sumStars += g.rating * g._count.rating;
      }
    }

    const averageRating = totalRatings > 0 ? Number((sumStars / totalRatings).toFixed(1)) : 0;

    const calcPercentage = (count: number) =>
      totalRatings > 0 ? Number(((count / totalRatings) * 100).toFixed(1)) : 0;

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

  /**
   * Helper: Builds ordered, pre-filled zero coordinates for time-series charts.
   */
  private buildTimeBuckets(period: DashboardPeriod): {
    startDate: Date;
    endDate: Date;
    buckets: Array<{ key: string; label: string; date?: string }>;
    resolveBucketKey: (d: Date) => string;
  } {
    const now = new Date();

    if (period === DashboardPeriod.DAY) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const buckets: Array<{ key: string; label: string }> = [];

      for (let hour = 0; hour < 24; hour++) {
        const hh = hour.toString().padStart(2, '0') + ':00';
        buckets.push({ key: hh, label: hh });
      }

      return {
        startDate,
        endDate,
        buckets,
        resolveBucketKey: (d: Date) => d.getHours().toString().padStart(2, '0') + ':00',
      };
    }

    if (period === DashboardPeriod.WEEK) {
      // Last 7 days including today
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const buckets: Array<{ key: string; label: string; date: string }> = [];

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
        resolveBucketKey: (d: Date) => this.formatDate(d),
      };
    }

    if (period === DashboardPeriod.MONTH) {
      // Current month days 1..N
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const endDate = new Date(now.getFullYear(), now.getMonth(), lastDay, 23, 59, 59, 999);
      const buckets: Array<{ key: string; label: string; date: string }> = [];

      for (let day = 1; day <= lastDay; day++) {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        const yyyyMmDd = this.formatDate(d);
        buckets.push({ key: yyyyMmDd, label: day.toString(), date: yyyyMmDd });
      }

      return {
        startDate,
        endDate,
        buckets,
        resolveBucketKey: (d: Date) => this.formatDate(d),
      };
    }

    // YEAR: 12 months (Jan..Dec)
    const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const buckets: Array<{ key: string; label: string }> = [];

    for (let m = 0; m < 12; m++) {
      buckets.push({ key: m.toString(), label: monthNames[m] });
    }

    return {
      startDate,
      endDate,
      buckets,
      resolveBucketKey: (d: Date) => d.getMonth().toString(),
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatTime(date: Date): string {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
