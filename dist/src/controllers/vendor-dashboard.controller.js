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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const vendor_only_guard_1 = require("../common/guards/vendor-only.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const vendor_dashboard_service_1 = require("../services/vendor-dashboard.service");
const vendor_dashboard_dto_1 = require("../dto/vendor-dashboard.dto");
let VendorDashboardController = class VendorDashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getAnalytics(user) {
        const data = await this.dashboardService.getAnalytics(user.userId);
        return {
            message: 'Dashboard analytics fetched successfully',
            data,
        };
    }
    async getViewsGraph(user, query) {
        const data = await this.dashboardService.getViewsGraph(user.userId, query.period);
        return {
            message: 'Views graph data fetched successfully',
            data,
        };
    }
    async getEnquiriesGraph(user, query) {
        const data = await this.dashboardService.getEnquiriesGraph(user.userId, query.period);
        return {
            message: 'Enquiries graph data fetched successfully',
            data,
        };
    }
    async getEnquiries(user, query) {
        const data = await this.dashboardService.getEnquiries(user.userId, query.page, query.limit);
        return {
            message: 'Enquiries fetched successfully',
            data,
        };
    }
    async getRatings(user, query) {
        const data = await this.dashboardService.getRatings(user.userId, query.page, query.limit);
        return {
            message: 'Ratings fetched successfully',
            data,
        };
    }
    async getRatingSummary(user) {
        const data = await this.dashboardService.getRatingSummary(user.userId);
        return {
            message: 'Rating summary fetched successfully',
            data,
        };
    }
};
exports.VendorDashboardController = VendorDashboardController;
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Dashboard Analytics',
        description: 'Returns overall summary metrics (store views, customer enquiries, ratings, and listed products) for the authenticated vendor.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_dashboard_dto_1.DashboardAnalyticsResponseDto, 200, 'Dashboard analytics fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('views-graph'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Store Views Graph',
        description: 'Returns store views time series data for the selected period (day: 24h, week: 7d, month: 30d, year: 12m) with zero-filled intervals for smooth graph rendering in Flutter.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_dashboard_dto_1.DashboardGraphResponseDto, 200, 'Views graph data fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid period parameter', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, vendor_dashboard_dto_1.DashboardGraphQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getViewsGraph", null);
__decorate([
    (0, common_1.Get)('enquiries-graph'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Customer Enquiries Graph',
        description: 'Returns customer enquiries time series data for the selected period (day: 24h, week: 7d, month: 30d, year: 12m) with zero-filled intervals for smooth graph rendering in Flutter.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_dashboard_dto_1.DashboardGraphResponseDto, 200, 'Enquiries graph data fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid period parameter', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, vendor_dashboard_dto_1.DashboardGraphQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getEnquiriesGraph", null);
__decorate([
    (0, common_1.Get)('enquiries'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Customer Enquiries List',
        description: 'Returns paginated customer enquiries (latest first) with customer details, message, and referenced jewellery showcase item.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_dashboard_dto_1.EnquiriesListResponseDto, 200, 'Enquiries fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid pagination query', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, vendor_dashboard_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getEnquiries", null);
__decorate([
    (0, common_1.Get)('ratings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Vendor Ratings & Reviews List',
        description: 'Returns paginated list of ratings and customer reviews (latest first) with star values, descriptions, and customer information.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_dashboard_dto_1.RatingsListResponseDto, 200, 'Ratings fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid pagination query', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, vendor_dashboard_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getRatings", null);
__decorate([
    (0, common_1.Get)('rating-summary'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Vendor Rating Summary',
        description: 'Returns overall rating count, average rating (1–5), and 1 to 5 star distribution breakdown with counts and percentages.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_dashboard_dto_1.RatingSummaryResponseDto, 200, 'Rating summary fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor accounts only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vendor profile not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorDashboardController.prototype, "getRatingSummary", null);
exports.VendorDashboardController = VendorDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, common_1.Controller)('vendor/dashboard'),
    __metadata("design:paramtypes", [vendor_dashboard_service_1.VendorDashboardService])
], VendorDashboardController);
//# sourceMappingURL=vendor-dashboard.controller.js.map