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
exports.RatingSummaryResponseDto = exports.RatingStarDistributionDto = exports.RatingsListResponseDto = exports.RatingListItemDto = exports.EnquiriesListResponseDto = exports.EnquiryListItemDto = exports.PaginationMetaDto = exports.ProductSummaryDto = exports.CustomerSummaryDto = exports.DashboardGraphResponseDto = exports.GraphDataPointDto = exports.DashboardAnalyticsResponseDto = exports.PaginationQueryDto = exports.DashboardGraphQueryDto = exports.DashboardPeriod = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var DashboardPeriod;
(function (DashboardPeriod) {
    DashboardPeriod["DAY"] = "day";
    DashboardPeriod["WEEK"] = "week";
    DashboardPeriod["MONTH"] = "month";
    DashboardPeriod["YEAR"] = "year";
})(DashboardPeriod || (exports.DashboardPeriod = DashboardPeriod = {}));
class DashboardGraphQueryDto {
    constructor() {
        this.period = DashboardPeriod.WEEK;
    }
}
exports.DashboardGraphQueryDto = DashboardGraphQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: DashboardPeriod,
        default: DashboardPeriod.WEEK,
        description: 'Time period for chart: day (hourly), week (daily), month (daily), or year (monthly)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DashboardPeriod, { message: "period must be one of: 'day', 'week', 'month', 'year'" }),
    __metadata("design:type", String)
], DashboardGraphQueryDto.prototype, "period", void 0);
class PaginationQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.PaginationQueryDto = PaginationQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: 1,
        minimum: 1,
        description: 'Page number for pagination (starts at 1)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'page must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'page must be greater than or equal to 1' }),
    __metadata("design:type", Number)
], PaginationQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: 10,
        minimum: 1,
        maximum: 100,
        description: 'Number of records per page (max 100)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'limit must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'limit must be greater than or equal to 1' }),
    (0, class_validator_1.Max)(100, { message: 'limit cannot exceed 100' }),
    __metadata("design:type", Number)
], PaginationQueryDto.prototype, "limit", void 0);
class DashboardAnalyticsResponseDto {
}
exports.DashboardAnalyticsResponseDto = DashboardAnalyticsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1420, description: "Total number of users who have viewed the vendor's store" }),
    __metadata("design:type", Number)
], DashboardAnalyticsResponseDto.prototype, "totalStoreViews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85, description: 'Total number of customer enquiries received by the vendor' }),
    __metadata("design:type", Number)
], DashboardAnalyticsResponseDto.prototype, "totalEnquiries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42, description: 'Total number of ratings/reviews received by the vendor' }),
    __metadata("design:type", Number)
], DashboardAnalyticsResponseDto.prototype, "totalRatings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Total number of jewellery products listed in showcase by the vendor' }),
    __metadata("design:type", Number)
], DashboardAnalyticsResponseDto.prototype, "totalProductsListed", void 0);
class GraphDataPointDto {
}
exports.GraphDataPointDto = GraphDataPointDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mon', description: 'Label for graph axis (e.g. hour, weekday, day, or month)' }),
    __metadata("design:type", String)
], GraphDataPointDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-09-21', description: 'Date in YYYY-MM-DD format if applicable' }),
    __metadata("design:type", String)
], GraphDataPointDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 14, description: 'Event count for this time bucket' }),
    __metadata("design:type", Number)
], GraphDataPointDto.prototype, "count", void 0);
class DashboardGraphResponseDto {
}
exports.DashboardGraphResponseDto = DashboardGraphResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DashboardPeriod, example: 'week' }),
    __metadata("design:type", String)
], DashboardGraphResponseDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 128, description: 'Total count across the selected period' }),
    __metadata("design:type", Number)
], DashboardGraphResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GraphDataPointDto], description: 'Ordered time series graph data points with pre-filled zero coordinates' }),
    __metadata("design:type", Array)
], DashboardGraphResponseDto.prototype, "points", void 0);
class CustomerSummaryDto {
}
exports.CustomerSummaryDto = CustomerSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pooja Verma' }),
    __metadata("design:type", String)
], CustomerSummaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210' }),
    __metadata("design:type", String)
], CustomerSummaryDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://s3.amazonaws.com/bucket/profile.jpg', nullable: true }),
    __metadata("design:type", Object)
], CustomerSummaryDto.prototype, "profileImage", void 0);
class ProductSummaryDto {
}
exports.ProductSummaryDto = ProductSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }),
    __metadata("design:type", String)
], ProductSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kundan Choker Necklace' }),
    __metadata("design:type", String)
], ProductSummaryDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/bucket/necklace.jpg' }),
    __metadata("design:type", String)
], ProductSummaryDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '45000.00' }),
    __metadata("design:type", String)
], ProductSummaryDto.prototype, "price", void 0);
class PaginationMetaDto {
}
exports.PaginationMetaDto = PaginationMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85 }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "totalRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 9 }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "totalPages", void 0);
class EnquiryListItemDto {
}
exports.EnquiryListItemDto = EnquiryListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ENQ100001', description: 'Unique public enquiry identifier' }),
    __metadata("design:type", String)
], EnquiryListItemDto.prototype, "enquiryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Is this necklace available in 22K gold?' }),
    __metadata("design:type", String)
], EnquiryListItemDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CustomerSummaryDto }),
    __metadata("design:type", CustomerSummaryDto)
], EnquiryListItemDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ProductSummaryDto, nullable: true }),
    __metadata("design:type", Object)
], EnquiryListItemDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-27', description: 'Date of enquiry (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], EnquiryListItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '14:30:00', description: 'Time of enquiry (HH:mm:ss)' }),
    __metadata("design:type", String)
], EnquiryListItemDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-27T14:30:00.000Z', description: 'Full ISO timestamp' }),
    __metadata("design:type", Date)
], EnquiryListItemDto.prototype, "createdAt", void 0);
class EnquiriesListResponseDto {
}
exports.EnquiriesListResponseDto = EnquiriesListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EnquiryListItemDto] }),
    __metadata("design:type", Array)
], EnquiriesListResponseDto.prototype, "enquiries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationMetaDto }),
    __metadata("design:type", PaginationMetaDto)
], EnquiriesListResponseDto.prototype, "pagination", void 0);
class RatingListItemDto {
}
exports.RatingListItemDto = RatingListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }),
    __metadata("design:type", String)
], RatingListItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4, minimum: 1, maximum: 5, description: 'Star rating from 1 to 5' }),
    __metadata("design:type", Number)
], RatingListItemDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Beautiful craftsmanship and fast delivery!', nullable: true }),
    __metadata("design:type", Object)
], RatingListItemDto.prototype, "review", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yogesh Soni' }),
    __metadata("design:type", String)
], RatingListItemDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://s3.amazonaws.com/bucket/profile.jpg', nullable: true }),
    __metadata("design:type", Object)
], RatingListItemDto.prototype, "customerProfileImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-27', description: 'Date of rating (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], RatingListItemDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '14:30:00', description: 'Time of rating (HH:mm:ss)' }),
    __metadata("design:type", String)
], RatingListItemDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-27T14:30:00.000Z', description: 'Full ISO timestamp' }),
    __metadata("design:type", Date)
], RatingListItemDto.prototype, "createdAt", void 0);
class RatingsListResponseDto {
}
exports.RatingsListResponseDto = RatingsListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RatingListItemDto] }),
    __metadata("design:type", Array)
], RatingsListResponseDto.prototype, "ratings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationMetaDto }),
    __metadata("design:type", PaginationMetaDto)
], RatingsListResponseDto.prototype, "pagination", void 0);
class RatingStarDistributionDto {
}
exports.RatingStarDistributionDto = RatingStarDistributionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 28, description: 'Number of ratings with this star count' }),
    __metadata("design:type", Number)
], RatingStarDistributionDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 66.7, description: 'Percentage of total ratings' }),
    __metadata("design:type", Number)
], RatingStarDistributionDto.prototype, "percentage", void 0);
class RatingSummaryResponseDto {
}
exports.RatingSummaryResponseDto = RatingSummaryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42, description: 'Total number of ratings' }),
    __metadata("design:type", Number)
], RatingSummaryResponseDto.prototype, "totalRatings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.6, description: 'Average rating rounded to 1 decimal place' }),
    __metadata("design:type", Number)
], RatingSummaryResponseDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rating breakdown distribution for 1, 2, 3, 4, and 5 stars',
        example: {
            '5': { count: 28, percentage: 66.7 },
            '4': { count: 10, percentage: 23.8 },
            '3': { count: 3, percentage: 7.1 },
            '2': { count: 1, percentage: 2.4 },
            '1': { count: 0, percentage: 0 },
        },
    }),
    __metadata("design:type", Object)
], RatingSummaryResponseDto.prototype, "distribution", void 0);
//# sourceMappingURL=vendor-dashboard.dto.js.map