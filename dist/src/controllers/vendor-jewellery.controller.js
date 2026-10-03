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
exports.VendorJewelleryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const vendor_only_guard_1 = require("../common/guards/vendor-only.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const jewellery_service_1 = require("../services/jewellery.service");
const jewellery_dto_1 = require("../dto/jewellery.dto");
let VendorJewelleryController = class VendorJewelleryController {
    constructor(jewelleryService) {
        this.jewelleryService = jewelleryService;
    }
    async createJewellery(user, dto, files) {
        const data = await this.jewelleryService.createJewellery(user.userId, dto, files);
        return {
            message: 'Jewellery item added successfully',
            data,
        };
    }
    async getVendorJewellery(user, query) {
        const data = await this.jewelleryService.getVendorJewellery(user.userId, query);
        return {
            message: 'Jewellery inventory retrieved successfully',
            data,
        };
    }
    async getJewelleryById(user, id) {
        const data = await this.jewelleryService.getJewelleryById(user.userId, id);
        return {
            message: 'Jewellery details retrieved successfully',
            data,
        };
    }
    async updateJewellery(user, id, dto, files) {
        const data = await this.jewelleryService.updateJewellery(user.userId, id, dto, files);
        return {
            message: 'Jewellery item updated successfully',
            data,
        };
    }
    async deleteJewellery(user, id) {
        return this.jewelleryService.deleteJewellery(user.userId, id);
    }
    async getPublicJewellery(query, vendorProfileId) {
        const data = await this.jewelleryService.getPublicJewellery(query, vendorProfileId);
        return {
            message: 'Marketplace jewellery fetched successfully',
            data,
        };
    }
    async getPublicJewelleryById(id) {
        const data = await this.jewelleryService.getPublicJewelleryById(id);
        return {
            message: 'Jewellery details fetched successfully',
            data,
        };
    }
};
exports.VendorJewelleryController = VendorJewelleryController;
__decorate([
    (0, common_1.Post)('vendor/jewellery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, {
        storage: (0, multer_1.memoryStorage)(),
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add Jewellery Item (Vendor)',
        description: 'Creates a new jewellery product with up to 5 images, specifications (type, weight, purity, gender), occasion details, and optional discount.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(jewellery_dto_1.JewelleryResponseDto, 201, 'Jewellery created successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (INVALID_IMAGE, TOO_MANY_IMAGES)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor account required (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jewellery_dto_1.CreateJewelleryDto, Array]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "createJewellery", null);
__decorate([
    (0, common_1.Get)('vendor/jewellery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get All Jewellery Items (Vendor)',
        description: 'Returns paginated list of all jewellery products owned by the authenticated vendor with search and filtering.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jewellery_dto_1.JewelleryQueryDto]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "getVendorJewellery", null);
__decorate([
    (0, common_1.Get)('vendor/jewellery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Single Jewellery Item by ID (Vendor)',
        description: 'Fetches complete specifications of a specific jewellery item.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Item not found (SHOWCASE_ITEM_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "getJewelleryById", null);
__decorate([
    (0, common_1.Put)('vendor/jewellery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, {
        storage: (0, multer_1.memoryStorage)(),
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Edit / Update Jewellery Item (Vendor)',
        description: 'Updates an existing jewellery item specifications, discount, occasion, and images.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Item not found', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, jewellery_dto_1.UpdateJewelleryDto, Array]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "updateJewellery", null);
__decorate([
    (0, common_1.Delete)('vendor/jewellery/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete Jewellery Item (Vendor)',
        description: 'Permanently deletes a jewellery item and removes all its images from cloud storage.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Item not found', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "deleteJewellery", null);
__decorate([
    (0, common_1.Get)('jewellery'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Public Marketplace Jewellery Feed (Buyer App)',
        description: 'Public endpoint to fetch published jewellery items across stores or for a specific vendor.',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('vendorProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jewellery_dto_1.JewelleryQueryDto, String]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "getPublicJewellery", null);
__decorate([
    (0, common_1.Get)('jewellery/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Public Jewellery Item Details (Buyer App)',
        description: 'Public endpoint to view single jewellery item and seller info.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VendorJewelleryController.prototype, "getPublicJewelleryById", null);
exports.VendorJewelleryController = VendorJewelleryController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Jewellery'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [jewellery_service_1.JewelleryService])
], VendorJewelleryController);
//# sourceMappingURL=vendor-jewellery.controller.js.map