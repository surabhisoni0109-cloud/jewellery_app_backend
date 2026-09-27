import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VendorOnlyGuard } from '../common/guards/vendor-only.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';
import { VendorDashboardService } from '../services/vendor-dashboard.service';
import {
  DashboardAnalyticsResponseDto,
  DashboardGraphQueryDto,
  DashboardGraphResponseDto,
  EnquiriesListResponseDto,
  PaginationQueryDto,
  RatingsListResponseDto,
  RatingSummaryResponseDto,
} from '../dto/vendor-dashboard.dto';

@ApiTags('Vendor Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorOnlyGuard)
@Controller('vendor/dashboard')
export class VendorDashboardController {
  constructor(private readonly dashboardService: VendorDashboardService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // 1.1 GET /vendor/dashboard/analytics
  // ─────────────────────────────────────────────────────────────────────────

  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Dashboard Analytics',
    description:
      'Returns overall summary metrics (store views, customer enquiries, ratings, and listed products) for the authenticated vendor.',
  })
  @ApiWrappedResponse(DashboardAnalyticsResponseDto, 200, 'Dashboard analytics fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getAnalytics(@CurrentUser() user: User) {
    const data = await this.dashboardService.getAnalytics(user.userId);
    return {
      message: 'Dashboard analytics fetched successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.2 GET /vendor/dashboard/views-graph
  // ─────────────────────────────────────────────────────────────────────────

  @Get('views-graph')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Store Views Graph',
    description:
      'Returns store views time series data for the selected period (day: 24h, week: 7d, month: 30d, year: 12m) with zero-filled intervals for smooth graph rendering in Flutter.',
  })
  @ApiWrappedResponse(DashboardGraphResponseDto, 200, 'Views graph data fetched successfully')
  @ApiResponse({ status: 400, description: 'Invalid period parameter', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getViewsGraph(
    @CurrentUser() user: User,
    @Query() query: DashboardGraphQueryDto,
  ) {
    const data = await this.dashboardService.getViewsGraph(user.userId, query.period);
    return {
      message: 'Views graph data fetched successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.3 GET /vendor/dashboard/enquiries-graph
  // ─────────────────────────────────────────────────────────────────────────

  @Get('enquiries-graph')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Customer Enquiries Graph',
    description:
      'Returns customer enquiries time series data for the selected period (day: 24h, week: 7d, month: 30d, year: 12m) with zero-filled intervals for smooth graph rendering in Flutter.',
  })
  @ApiWrappedResponse(DashboardGraphResponseDto, 200, 'Enquiries graph data fetched successfully')
  @ApiResponse({ status: 400, description: 'Invalid period parameter', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getEnquiriesGraph(
    @CurrentUser() user: User,
    @Query() query: DashboardGraphQueryDto,
  ) {
    const data = await this.dashboardService.getEnquiriesGraph(user.userId, query.period);
    return {
      message: 'Enquiries graph data fetched successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.4 GET /vendor/dashboard/enquiries
  // ─────────────────────────────────────────────────────────────────────────

  @Get('enquiries')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Customer Enquiries List',
    description:
      'Returns paginated customer enquiries (latest first) with customer details, message, and referenced jewellery showcase item.',
  })
  @ApiWrappedResponse(EnquiriesListResponseDto, 200, 'Enquiries fetched successfully')
  @ApiResponse({ status: 400, description: 'Invalid pagination query', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getEnquiries(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ) {
    const data = await this.dashboardService.getEnquiries(
      user.userId,
      query.page,
      query.limit,
    );
    return {
      message: 'Enquiries fetched successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.5 GET /vendor/dashboard/ratings
  // ─────────────────────────────────────────────────────────────────────────

  @Get('ratings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Vendor Ratings & Reviews List',
    description:
      'Returns paginated list of ratings and customer reviews (latest first) with star values, descriptions, and customer information.',
  })
  @ApiWrappedResponse(RatingsListResponseDto, 200, 'Ratings fetched successfully')
  @ApiResponse({ status: 400, description: 'Invalid pagination query', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getRatings(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ) {
    const data = await this.dashboardService.getRatings(
      user.userId,
      query.page,
      query.limit,
    );
    return {
      message: 'Ratings fetched successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1.6 GET /vendor/dashboard/rating-summary
  // ─────────────────────────────────────────────────────────────────────────

  @Get('rating-summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Vendor Rating Summary',
    description:
      'Returns overall rating count, average rating (1–5), and 1 to 5 star distribution breakdown with counts and percentages.',
  })
  @ApiWrappedResponse(RatingSummaryResponseDto, 200, 'Rating summary fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getRatingSummary(@CurrentUser() user: User) {
    const data = await this.dashboardService.getRatingSummary(user.userId);
    return {
      message: 'Rating summary fetched successfully',
      data,
    };
  }
}
