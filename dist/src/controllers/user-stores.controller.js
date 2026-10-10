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
exports.UserStoresController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_only_guard_1 = require("../common/guards/user-only.guard");
const optional_jwt_auth_guard_1 = require("../common/guards/optional-jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const user_stores_service_1 = require("../services/user-stores.service");
const user_stores_dto_1 = require("../dto/user-stores.dto");
let UserStoresController = class UserStoresController {
    constructor(userStoresService) {
        this.userStoresService = userStoresService;
    }
    async getStores(query, user) {
        const data = await this.userStoresService.getStores(query, user?.userId);
        return { message: 'Stores discovered successfully', data };
    }
    async getStoreDetails(storeId, user) {
        const data = await this.userStoresService.getStoreDetails(storeId, user?.userId);
        return { message: 'Store details fetched successfully', data };
    }
    async getStoreJewellery(storeId, query) {
        const data = await this.userStoresService.getStoreJewellery(storeId, query);
        return { message: 'Store jewellery catalog fetched successfully', data };
    }
    async getStoreRatings(storeId, query) {
        const data = await this.userStoresService.getStoreRatings(storeId, query);
        return { message: 'Store reviews fetched successfully', data };
    }
    async createOrUpdateRating(user, storeId, dto) {
        const data = await this.userStoresService.createOrUpdateRating(user.userId, storeId, dto);
        return { message: data.message, data: data.rating };
    }
    async createEnquiry(user, storeId, dto) {
        const data = await this.userStoresService.createEnquiry(user.userId, storeId, dto);
        return { message: 'Enquiry sent successfully', data };
    }
};
exports.UserStoresController = UserStoresController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Discover Jewellery Stores',
        description: 'List onboarded jewellery stores. If the user is logged in, automatically personalizes and sorts by nearest stores using their saved profile location (like big apps). Supports search by store UUID, vendor ID, name, or area.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stores discovered successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_stores_dto_1.StoreQueryDto, Object]),
    __metadata("design:returntype", Promise)
], UserStoresController.prototype, "getStores", null);
__decorate([
    (0, common_1.Get)(':storeId'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Store Details Page',
        description: 'Fetches complete store profile, cover images, contact details, timings, address, and ratings breakdown. Automatically registers store view and computes distance if user has saved location.',
    }),
    (0, swagger_1.ApiParam)({ name: 'storeId', description: 'Store UUID or public vendor ID (e.g. VND100001)' }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(user_stores_dto_1.StoreDetailsDto, 200, 'Store details fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserStoresController.prototype, "getStoreDetails", null);
__decorate([
    (0, common_1.Get)(':storeId/jewellery'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Store Jewellery Catalog',
        description: 'Fetch published jewellery pieces for a store with filtering by type, gender, discounts, and pagination.',
    }),
    (0, swagger_1.ApiParam)({ name: 'storeId', description: 'Store UUID or public vendor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Store jewellery catalog fetched successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_stores_dto_1.StoreJewelleryQueryDto]),
    __metadata("design:returntype", Promise)
], UserStoresController.prototype, "getStoreJewellery", null);
__decorate([
    (0, common_1.Get)(':storeId/ratings'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Store Ratings & Reviews',
        description: 'Fetch review list with reviewer name, profile image, star score, comment, and overall star distribution.',
    }),
    (0, swagger_1.ApiParam)({ name: 'storeId', description: 'Store UUID or public vendor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Store reviews fetched successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_stores_dto_1.StoreRatingsQueryDto]),
    __metadata("design:returntype", Promise)
], UserStoresController.prototype, "getStoreRatings", null);
__decorate([
    (0, common_1.Post)(':storeId/ratings'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, user_only_guard_1.UserOnlyGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Rate & Review Store',
        description: 'Submit or update a rating (1-5 stars) and review text for this store. Restricted to buyer accounts.',
    }),
    (0, swagger_1.ApiParam)({ name: 'storeId', description: 'Store UUID or public vendor ID' }),
    (0, swagger_1.ApiBody)({ type: user_stores_dto_1.CreateStoreRatingDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review submitted or updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Customer only (USER_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, user_stores_dto_1.CreateStoreRatingDto]),
    __metadata("design:returntype", Promise)
], UserStoresController.prototype, "createOrUpdateRating", null);
__decorate([
    (0, common_1.Post)(':storeId/enquiry'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, user_only_guard_1.UserOnlyGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Send Store Enquiry',
        description: 'Submit an enquiry to the store (general enquiry or for a specific jewellery item). Auto-attaches customer name, mobile, and profile image.',
    }),
    (0, swagger_1.ApiParam)({ name: 'storeId', description: 'Store UUID or public vendor ID' }),
    (0, swagger_1.ApiBody)({ type: user_stores_dto_1.CreateStoreEnquiryDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Enquiry sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Customer only (USER_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Store or item not found', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, user_stores_dto_1.CreateStoreEnquiryDto]),
    __metadata("design:returntype", Promise)
], UserStoresController.prototype, "createEnquiry", null);
exports.UserStoresController = UserStoresController = __decorate([
    (0, swagger_1.ApiTags)('User Stores'),
    (0, common_1.Controller)('user/stores'),
    __metadata("design:paramtypes", [user_stores_service_1.UserStoresService])
], UserStoresController);
//# sourceMappingURL=user-stores.controller.js.map