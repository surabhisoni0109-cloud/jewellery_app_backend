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
exports.OnboardingStatusResponseDto = exports.Step3ResponseDto = exports.ShowcaseItemResponseDto = exports.Step2ResponseDto = exports.Step1ResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class Step1ResponseDto {
}
exports.Step1ResponseDto = Step1ResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STEP_1_DONE', enum: client_1.OnboardingStep }),
    __metadata("design:type", String)
], Step1ResponseDto.prototype, "onboardingStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MALE', enum: client_1.Gender }),
    __metadata("design:type", String)
], Step1ResponseDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1995-06-15' }),
    __metadata("design:type", String)
], Step1ResponseDto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/bucket/vendors/VND100001/profile.jpg', nullable: true }),
    __metadata("design:type", Object)
], Step1ResponseDto.prototype, "profilePicture", void 0);
class Step2ResponseDto {
}
exports.Step2ResponseDto = Step2ResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STEP_2_DONE', enum: client_1.OnboardingStep }),
    __metadata("design:type", String)
], Step2ResponseDto.prototype, "onboardingStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Soni Jewellers' }),
    __metadata("design:type", String)
], Step2ResponseDto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/bucket/vendors/VND100001/logo.jpg', nullable: true }),
    __metadata("design:type", Object)
], Step2ResponseDto.prototype, "storeLogo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['https://s3.amazonaws.com/...'] }),
    __metadata("design:type", Array)
], Step2ResponseDto.prototype, "storeCoverImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { city: 'Jaipur', state: 'Rajasthan', country: 'India' } }),
    __metadata("design:type", Object)
], Step2ResponseDto.prototype, "storeLocation", void 0);
class ShowcaseItemResponseDto {
}
exports.ShowcaseItemResponseDto = ShowcaseItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-xxxx' }),
    __metadata("design:type", String)
], ShowcaseItemResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kundan Necklace' }),
    __metadata("design:type", String)
], ShowcaseItemResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hand-crafted piece', nullable: true }),
    __metadata("design:type", Object)
], ShowcaseItemResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25000.00 }),
    __metadata("design:type", Number)
], ShowcaseItemResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/...' }),
    __metadata("design:type", String)
], ShowcaseItemResponseDto.prototype, "imageUrl", void 0);
class Step3ResponseDto {
}
exports.Step3ResponseDto = Step3ResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'COMPLETED', enum: client_1.OnboardingStep }),
    __metadata("design:type", String)
], Step3ResponseDto.prototype, "onboardingStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], Step3ResponseDto.prototype, "isOnboarded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], Step3ResponseDto.prototype, "itemsAdded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ShowcaseItemResponseDto] }),
    __metadata("design:type", Array)
], Step3ResponseDto.prototype, "showcase", void 0);
class OnboardingStatusResponseDto {
}
exports.OnboardingStatusResponseDto = OnboardingStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STEP_1_DONE', enum: client_1.OnboardingStep }),
    __metadata("design:type", String)
], OnboardingStatusResponseDto.prototype, "onboardingStep", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], OnboardingStatusResponseDto.prototype, "isOnboarded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [1], type: [Number] }),
    __metadata("design:type", Array)
], OnboardingStatusResponseDto.prototype, "completedSteps", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, nullable: true }),
    __metadata("design:type", Object)
], OnboardingStatusResponseDto.prototype, "nextStep", void 0);
//# sourceMappingURL=vendor-onboarding-response.dto.js.map