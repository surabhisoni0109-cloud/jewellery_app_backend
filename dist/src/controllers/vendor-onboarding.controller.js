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
exports.VendorOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const vendor_only_guard_1 = require("../common/guards/vendor-only.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const vendor_onboarding_service_1 = require("../services/vendor-onboarding.service");
const vendor_onboarding_step1_dto_1 = require("../dto/vendor-onboarding-step1.dto");
const vendor_onboarding_step2_dto_1 = require("../dto/vendor-onboarding-step2.dto");
const vendor_onboarding_step3_dto_1 = require("../dto/vendor-onboarding-step3.dto");
const vendor_onboarding_response_dto_1 = require("../dto/vendor-onboarding-response.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const multerMemoryOptions = { storage: (0, multer_1.memoryStorage)() };
async function parseAndValidateDto(cls, body) {
    if (body.storeLocation && typeof body.storeLocation === 'string') {
        try {
            body.storeLocation = JSON.parse(body.storeLocation);
        }
        catch {
            throw new custom_exception_1.CustomException('storeLocation must be a valid JSON object', 'INVALID_LOCATION', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    if (body.items && typeof body.items === 'string') {
        try {
            body.items = JSON.parse(body.items);
        }
        catch {
            throw new custom_exception_1.CustomException('items must be a valid JSON array', 'INVALID_ITEMS', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    const instance = (0, class_transformer_1.plainToInstance)(cls, body, { enableImplicitConversion: true });
    const errors = await (0, class_validator_1.validate)(instance, { whitelist: true, stopAtFirstError: false });
    if (errors.length > 0) {
        const collectMessages = (errs) => errs.flatMap((e) => [
            ...Object.values(e.constraints ?? {}),
            ...collectMessages(e.children ?? []),
        ]);
        const messages = collectMessages(errors);
        throw new custom_exception_1.CustomException(messages.length > 0 ? messages.join('; ') : 'Validation failed', 'VALIDATION_ERROR', common_1.HttpStatus.BAD_REQUEST);
    }
    return instance;
}
let VendorOnboardingController = class VendorOnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async getOnboardingStatus(user) {
        const data = await this.onboardingService.getOnboardingStatus(user.userId);
        return { message: 'Onboarding status fetched successfully', data };
    }
    async getStep1(user) {
        const data = await this.onboardingService.getStep1(user.userId);
        return { message: 'Personal profile fetched successfully', data };
    }
    async updateStep1(user, rawBody, profilePicture) {
        const dto = await parseAndValidateDto(vendor_onboarding_step1_dto_1.VendorOnboardingStep1Dto, rawBody);
        const data = await this.onboardingService.updateStep1(user.userId, dto, profilePicture);
        return { message: 'Personal profile updated successfully', data };
    }
    async getStep2(user) {
        const data = await this.onboardingService.getStep2(user.userId);
        return { message: 'Store profile fetched successfully', data };
    }
    async updateStep2(user, rawBody, files) {
        const dto = await parseAndValidateDto(vendor_onboarding_step2_dto_1.VendorOnboardingStep2Dto, rawBody);
        const data = await this.onboardingService.updateStep2(user.userId, dto, files?.storeLogo?.[0], files?.storeCoverImages);
        return { message: 'Store profile updated successfully', data };
    }
    async getStep3(user) {
        const data = await this.onboardingService.getStep3(user.userId);
        return { message: 'Jewellery showcase fetched successfully', data };
    }
    async addShowcaseItems(user, rawBody, images) {
        const dto = await parseAndValidateDto(vendor_onboarding_step3_dto_1.VendorOnboardingStep3Dto, rawBody);
        const data = await this.onboardingService.addShowcaseItems(user.userId, dto, images ?? []);
        return { message: 'Jewellery showcase items added successfully', data };
    }
    async deleteShowcaseItem(user, itemId) {
        const data = await this.onboardingService.deleteShowcaseItem(user.userId, itemId);
        return { message: 'Showcase item deleted successfully', data };
    }
};
exports.VendorOnboardingController = VendorOnboardingController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Vendor Onboarding Status',
        description: 'Returns the current onboarding step and list of completed steps for the authenticated vendor.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.OnboardingStatusResponseDto, 200, 'Onboarding status fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only endpoint (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Get)('step-1'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Step 1 — Personal Profile',
        description: 'Fetch saved personal profile details (gender, date of birth, profile picture) and user account info.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.Step1ResponseDto, 200, 'Personal profile fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "getStep1", null);
__decorate([
    (0, common_1.Patch)('step-1'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', multerMemoryOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Step 1 — Personal Profile',
        description: 'Submit or update personal profile info: gender, date of birth, and optional profile picture.',
    }),
    (0, swagger_1.ApiBody)({ type: vendor_onboarding_step1_dto_1.VendorOnboardingStep1Dto }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.Step1ResponseDto, 200, 'Personal profile updated successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (INVALID_IMAGE, UNDERAGE)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "updateStep1", null);
__decorate([
    (0, common_1.Get)('step-2'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Step 2 — Store Profile',
        description: 'Fetch saved store profile details (name, description, logo, cover images, location, pricing, contact details, timings, and founding year).',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.Step2ResponseDto, 200, 'Store profile fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "getStep2", null);
__decorate([
    (0, common_1.Patch)('step-2'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'storeLogo', maxCount: 1 },
        { name: 'storeCoverImages', maxCount: 5 },
    ], multerMemoryOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Step 2 — Store Profile',
        description: 'Submit or update store info: name, description, logo, cover images (up to 5), location, pricing, contact details, timings, and founding year.',
    }),
    (0, swagger_1.ApiBody)({ type: vendor_onboarding_step2_dto_1.VendorOnboardingStep2Dto }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.Step2ResponseDto, 200, 'Store profile updated successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (INVALID_IMAGE, INVALID_LOCATION, INVALID_TIME_RANGE, TOO_MANY_IMAGES)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "updateStep2", null);
__decorate([
    (0, common_1.Get)('step-3'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Step 3 — Jewellery Showcase',
        description: 'Fetch all jewellery showcase items for the authenticated vendor.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.Step3ResponseDto, 200, 'Jewellery showcase fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "getStep3", null);
__decorate([
    (0, common_1.Post)('step-3'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, multerMemoryOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Step 3 — Jewellery Showcase',
        description: 'Add up to 5 jewellery items (additively, max 5 total). Each item requires: image file, title, and price. Description is optional. Send `items` as a JSON-stringified array.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['items', 'images'],
            properties: {
                items: {
                    type: 'string',
                    example: '[{"title":"Kundan Necklace","description":"Hand-crafted","price":25000},{"title":"Gold Ring","price":5000}]',
                    description: 'JSON-stringified array of jewellery items (title, description?, price)',
                },
                images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Image files in the same order as items array (max 5 files, 5MB each)',
                },
            },
        },
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(vendor_onboarding_response_dto_1.Step3ResponseDto, 200, 'Jewellery showcase items added successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (INVALID_IMAGE, SHOWCASE_LIMIT_REACHED)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "addShowcaseItems", null);
__decorate([
    (0, common_1.Delete)('showcase/:itemId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete Showcase Item',
        description: 'Removes a jewellery showcase item by ID (also deletes the image from S3).',
    }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'UUID of the showcase item to delete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Showcase item deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Item not found (SHOWCASE_ITEM_NOT_FOUND)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VendorOnboardingController.prototype, "deleteShowcaseItem", null);
exports.VendorOnboardingController = VendorOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Vendor Onboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, vendor_only_guard_1.VendorOnlyGuard),
    (0, common_1.Controller)('vendor/onboarding'),
    __metadata("design:paramtypes", [vendor_onboarding_service_1.VendorOnboardingService])
], VendorOnboardingController);
//# sourceMappingURL=vendor-onboarding.controller.js.map