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
exports.VendorOnboardingStep2Dto = exports.StoreLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const indian_mobile_validator_1 = require("../common/validators/indian-mobile.validator");
const time_format_validator_1 = require("../common/validators/time-format.validator");
class StoreLocationDto {
}
exports.StoreLocationDto = StoreLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 28.6139, description: 'Latitude (optional)', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 77.209, description: 'Longitude (optional)', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123, Gold Street', description: 'Address line 1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Near ABC Mall', description: 'Address line 2 (optional)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Karol Bagh', description: 'Area / locality' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New Delhi', description: 'City' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Delhi', description: 'State' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'India', description: 'Country' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '110005', description: 'Pincode / postal code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreLocationDto.prototype, "pincode", void 0);
class VendorOnboardingStep2Dto {
}
exports.VendorOnboardingStep2Dto = VendorOnboardingStep2Dto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Soni Jewellers', description: 'Store name (max 100 chars)', required: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Premium handcrafted jewellery since 1985', description: 'Store description (max 1000 chars)', required: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1000),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Store location as a JSON string (latitude and longitude are optional)',
        example: '{"latitude":28.6139,"longitude":77.209,"addressLine1":"123 Gold St","area":"Karol Bagh","city":"New Delhi","state":"Delhi","country":"India","pincode":"110005"}',
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StoreLocationDto),
    __metadata("design:type", StoreLocationDto)
], VendorOnboardingStep2Dto.prototype, "storeLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1500.00, description: 'Jewellery starting price in INR (positive number)', required: true }),
    (0, class_validator_1.IsNumber)({}, { message: 'jewelleryStartingPrice must be a number' }),
    (0, class_validator_1.IsPositive)({ message: 'jewelleryStartingPrice must be a positive number' }),
    (0, class_transformer_1.Transform)(({ value }) => parseFloat(value)),
    __metadata("design:type", Number)
], VendorOnboardingStep2Dto.prototype, "jewelleryStartingPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://soni-jewellers.com', description: 'Store website URL (optional)', required: false }),
    (0, class_validator_1.IsUrl)({}, { message: 'storeWebsite must be a valid URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeWebsite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210', description: '10-digit Indian contact number for the store', required: true }),
    (0, indian_mobile_validator_1.IsIndianMobile)({ message: 'storeContactNumber must be a valid 10-digit Indian mobile number' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeContactNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact@sonijewellers.com', description: 'Store email address', required: true }),
    (0, class_validator_1.IsEmail)({}, { message: 'storeEmail must be a valid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00', description: 'Store opening time in HH:MM (24-hr) format', required: true }),
    (0, time_format_validator_1.IsTimeFormat)({ message: 'storeOpeningTime must be in HH:MM (24-hour) format' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeOpeningTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '21:00', description: 'Store closing time in HH:MM (24-hr) format — must be after opening time', required: true }),
    (0, time_format_validator_1.IsTimeFormat)({ message: 'storeClosingTime must be in HH:MM (24-hour) format' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeClosingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1985, description: 'Year the store was founded (between 1800 and current year)', required: true }),
    (0, class_validator_1.IsInt)({ message: 'storeFoundedYear must be an integer year' }),
    (0, class_validator_1.Min)(1800, { message: 'storeFoundedYear must be 1800 or later' }),
    (0, class_validator_1.Max)(new Date().getFullYear(), { message: `storeFoundedYear cannot be in the future` }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    __metadata("design:type", Number)
], VendorOnboardingStep2Dto.prototype, "storeFoundedYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', format: 'binary', description: 'Store logo image (jpg, jpeg, png, webp — max 5MB)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VendorOnboardingStep2Dto.prototype, "storeLogo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Up to 5 store cover images', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], VendorOnboardingStep2Dto.prototype, "storeCoverImages", void 0);
//# sourceMappingURL=vendor-onboarding-step2.dto.js.map