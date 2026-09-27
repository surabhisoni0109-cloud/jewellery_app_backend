export declare enum DashboardPeriod {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year"
}
export declare class DashboardGraphQueryDto {
    period: DashboardPeriod;
}
export declare class PaginationQueryDto {
    page: number;
    limit: number;
}
export declare class DashboardAnalyticsResponseDto {
    totalStoreViews: number;
    totalEnquiries: number;
    totalRatings: number;
    totalProductsListed: number;
}
export declare class GraphDataPointDto {
    label: string;
    date?: string;
    count: number;
}
export declare class DashboardGraphResponseDto {
    period: DashboardPeriod;
    total: number;
    points: GraphDataPointDto[];
}
export declare class CustomerSummaryDto {
    name: string;
    mobileNumber: string;
    profileImage: string | null;
}
export declare class ProductSummaryDto {
    id: string;
    title: string;
    imageUrl: string;
    price: string;
}
export declare class PaginationMetaDto {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
}
export declare class EnquiryListItemDto {
    enquiryId: string;
    message: string;
    customer: CustomerSummaryDto;
    product: ProductSummaryDto | null;
    date: string;
    time: string;
    createdAt: Date;
}
export declare class EnquiriesListResponseDto {
    enquiries: EnquiryListItemDto[];
    pagination: PaginationMetaDto;
}
export declare class RatingListItemDto {
    id: string;
    rating: number;
    review: string | null;
    customerName: string;
    customerProfileImage: string | null;
    date: string;
    time: string;
    createdAt: Date;
}
export declare class RatingsListResponseDto {
    ratings: RatingListItemDto[];
    pagination: PaginationMetaDto;
}
export declare class RatingStarDistributionDto {
    count: number;
    percentage: number;
}
export declare class RatingSummaryResponseDto {
    totalRatings: number;
    averageRating: number;
    distribution: {
        '1': RatingStarDistributionDto;
        '2': RatingStarDistributionDto;
        '3': RatingStarDistributionDto;
        '4': RatingStarDistributionDto;
        '5': RatingStarDistributionDto;
    };
}
