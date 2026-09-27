import { User } from '@prisma/client';
import { VendorDashboardService } from '../services/vendor-dashboard.service';
import { DashboardAnalyticsResponseDto, DashboardGraphQueryDto, DashboardGraphResponseDto, EnquiriesListResponseDto, PaginationQueryDto, RatingsListResponseDto, RatingSummaryResponseDto } from '../dto/vendor-dashboard.dto';
export declare class VendorDashboardController {
    private readonly dashboardService;
    constructor(dashboardService: VendorDashboardService);
    getAnalytics(user: User): Promise<{
        message: string;
        data: DashboardAnalyticsResponseDto;
    }>;
    getViewsGraph(user: User, query: DashboardGraphQueryDto): Promise<{
        message: string;
        data: DashboardGraphResponseDto;
    }>;
    getEnquiriesGraph(user: User, query: DashboardGraphQueryDto): Promise<{
        message: string;
        data: DashboardGraphResponseDto;
    }>;
    getEnquiries(user: User, query: PaginationQueryDto): Promise<{
        message: string;
        data: EnquiriesListResponseDto;
    }>;
    getRatings(user: User, query: PaginationQueryDto): Promise<{
        message: string;
        data: RatingsListResponseDto;
    }>;
    getRatingSummary(user: User): Promise<{
        message: string;
        data: RatingSummaryResponseDto;
    }>;
}
