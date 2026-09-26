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
exports.VendorOnboardingStep3Dto = exports.ShowcaseItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_transformer_2 = require("class-transformer");
class ShowcaseItemDto {
}
exports.ShowcaseItemDto = ShowcaseItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kundan Necklace', description: 'Jewellery item title (max 100 chars)', required: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], ShowcaseItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hand-crafted Kundan necklace with gold plating', description: 'Item description (max 500 chars)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], ShowcaseItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25000.00, description: 'Item price in INR (positive number)', required: true }),
    (0, class_validator_1.IsNumber)({}, { message: 'price must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'price must be a positive number' }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], ShowcaseItemDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', format: 'binary', description: 'Jewellery item image (jpg, jpeg, png, webp — max 5MB)', required: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ShowcaseItemDto.prototype, "image", void 0);
class VendorOnboardingStep3Dto {
}
exports.VendorOnboardingStep3Dto = VendorOnboardingStep3Dto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ShowcaseItemDto],
        description: 'Array of up to 5 jewellery showcase items',
        required: true,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one jewellery item must be provided' }),
    (0, class_validator_1.ArrayMaxSize)(5, { message: 'Maximum 5 jewellery items can be submitted at a time' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_2.Type)(() => ShowcaseItemDto),
    __metadata("design:type", Array)
], VendorOnboardingStep3Dto.prototype, "items", void 0);
//# sourceMappingURL=vendor-onboarding-step3.dto.js.map