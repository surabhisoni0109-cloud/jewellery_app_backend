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
exports.VendorOnboardingStep1Dto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const min_age_validator_1 = require("../common/validators/min-age.validator");
class VendorOnboardingStep1Dto {
}
exports.VendorOnboardingStep1Dto = VendorOnboardingStep1Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.Gender,
        example: 'MALE',
        description: 'Vendor gender',
        required: true,
    }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value)),
    (0, class_validator_1.IsEnum)(client_1.Gender, { message: 'gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VendorOnboardingStep1Dto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1995-06-15',
        description: 'Date of birth in YYYY-MM-DD format. Vendor must be at least 18 years old.',
        required: true,
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'dob must be a valid ISO date string (YYYY-MM-DD)' }),
    (0, min_age_validator_1.IsMinAge)(18, { message: 'Vendor must be at least 18 years old' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VendorOnboardingStep1Dto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: 'string',
        format: 'binary',
        description: 'Profile picture (jpg, jpeg, png, webp — max 5MB)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VendorOnboardingStep1Dto.prototype, "profilePicture", void 0);
//# sourceMappingURL=vendor-onboarding-step1.dto.js.map