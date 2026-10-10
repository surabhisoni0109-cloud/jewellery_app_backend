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
exports.UserOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const user_only_guard_1 = require("../common/guards/user-only.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const user_onboarding_service_1 = require("../services/user-onboarding.service");
const user_onboarding_dto_1 = require("../dto/user-onboarding.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const multerMemoryOptions = { storage: (0, multer_1.memoryStorage)() };
async function parseAndValidateDto(cls, body) {
    if (body.location && typeof body.location === 'string') {
        try {
            body.location = JSON.parse(body.location);
        }
        catch {
            throw new custom_exception_1.CustomException('location must be a valid JSON object', 'INVALID_LOCATION', common_1.HttpStatus.BAD_REQUEST);
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
let UserOnboardingController = class UserOnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async getOnboarding(user) {
        const data = await this.onboardingService.getOnboarding(user.userId);
        return { message: 'User onboarding details fetched successfully', data };
    }
    async submitOnboarding(user, rawBody, profilePicture) {
        const dto = await parseAndValidateDto(user_onboarding_dto_1.UserOnboardingDto, rawBody);
        const data = await this.onboardingService.submitOnboarding(user.userId, dto, profilePicture);
        return { message: 'User onboarding completed successfully', data };
    }
    async updateOnboarding(user, rawBody, profilePicture) {
        const dto = await parseAndValidateDto(user_onboarding_dto_1.UserOnboardingDto, rawBody);
        const data = await this.onboardingService.submitOnboarding(user.userId, dto, profilePicture);
        return { message: 'User onboarding updated successfully', data };
    }
};
exports.UserOnboardingController = UserOnboardingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get User Onboarding Profile',
        description: 'Fetch saved onboarding profile details (gender, date of birth, profile picture, location) and user account info for the authenticated buyer.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(user_onboarding_dto_1.UserOnboardingResponseDto, 200, 'User onboarding details fetched successfully'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Restricted to customer accounts (USER_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserOnboardingController.prototype, "getOnboarding", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', multerMemoryOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit User Onboarding',
        description: 'Submit onboarding info for buyer: firstName, lastName, email, gender, date of birth, location, and optional profile picture. Note: mobileNumber cannot be updated.',
    }),
    (0, swagger_1.ApiBody)({ type: user_onboarding_dto_1.UserOnboardingDto }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(user_onboarding_dto_1.UserOnboardingResponseDto, 200, 'User onboarding completed successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (INVALID_IMAGE, UNDERAGE, MOBILE_NUMBER_READ_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email conflict (EMAIL_ALREADY_EXISTS)', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Restricted to customer accounts (USER_ONLY)', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserOnboardingController.prototype, "submitOnboarding", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profilePicture', multerMemoryOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update User Onboarding (Patch)',
        description: 'Update onboarding info for buyer: firstName, lastName, email, gender, date of birth, location, and optional profile picture.',
    }),
    (0, swagger_1.ApiBody)({ type: user_onboarding_dto_1.UserOnboardingDto }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(user_onboarding_dto_1.UserOnboardingResponseDto, 200, 'User onboarding updated successfully'),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized', type: api_response_dto_1.ApiErrorResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden', type: api_response_dto_1.ApiErrorResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserOnboardingController.prototype, "updateOnboarding", null);
exports.UserOnboardingController = UserOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('User Onboarding'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, user_only_guard_1.UserOnlyGuard),
    (0, common_1.Controller)('user/onboarding'),
    __metadata("design:paramtypes", [user_onboarding_service_1.UserOnboardingService])
], UserOnboardingController);
//# sourceMappingURL=user-onboarding.controller.js.map