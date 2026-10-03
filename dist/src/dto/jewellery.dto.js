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
exports.JewelleryResponseDto = exports.JewelleryQueryDto = exports.UpdateJewelleryDto = exports.CreateJewelleryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateJewelleryDto {
    constructor() {
        this.hasSpecialOccasion = false;
        this.hasDiscount = false;
        this.isPublished = true;
    }
}
exports.CreateJewelleryDto = CreateJewelleryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Jewellery Name',
        example: '22K Royal Gold Kundan Necklace',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Jewellery name is required' }),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jewellery Description',
        example: 'Handcrafted heritage royal Kundan necklace with authentic hallmark certification.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Jewellery Price in INR',
        example: 85000,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Price must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Price cannot be negative' }),
    __metadata("design:type", Number)
], CreateJewelleryDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jewellery Type (e.g., Gold, Silver, Platinum, Diamond, Gemstone)',
        example: 'Gold',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "jewelleryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jewellery Weight (e.g., 10gram, 1.5gram)',
        example: '15.5 gram',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jewellery Purity (e.g., 24K, 22K, 18K, 925)',
        example: '22K',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "purity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Jewellery For (e.g., Men, Women, Unisex)',
        example: 'Women',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "jewelleryFor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Special occasion checkbox toggle (enables special occasion name & date)',
        default: false,
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateJewelleryDto.prototype, "hasSpecialOccasion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Special Occasion Name (e.g., Wedding, Diwali, Dhanteras, Anniversary)',
        example: 'Wedding',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateJewelleryDto.prototype, "specialOccasionName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Special Occasion Date',
        example: '2026-11-12T00:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateJewelleryDto.prototype, "specialOccasionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Discount checkbox toggle',
        default: false,
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateJewelleryDto.prototype, "hasDiscount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Discount percentage (e.g. 10 for 10% off)',
        example: 10,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateJewelleryDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Final discounted price (calculated automatically if not provided)',
        example: 76500,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateJewelleryDto.prototype, "discountPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Publish status (true = active in marketplace, false = draft)',
        default: true,
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateJewelleryDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Select multiple jewellery images from your device (up to 5 images, max 5MB each)',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateJewelleryDto.prototype, "images", void 0);
class UpdateJewelleryDto {
}
exports.UpdateJewelleryDto = UpdateJewelleryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '22K Royal Gold Kundan Necklace' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 85000 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateJewelleryDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gold' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "jewelleryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '15.5 gram' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '22K' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "purity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Women' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "jewelleryFor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateJewelleryDto.prototype, "hasSpecialOccasion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Wedding' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateJewelleryDto.prototype, "specialOccasionName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-11-12T00:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateJewelleryDto.prototype, "specialOccasionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateJewelleryDto.prototype, "hasDiscount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateJewelleryDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 76500 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateJewelleryDto.prototype, "discountPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateJewelleryDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Upload new jewellery images from your device (select multiple files, up to 5)',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateJewelleryDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Existing image URLs to retain when updating (optional, array of URLs or JSON string)',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return undefined;
        if (Array.isArray(value)) {
            return value.filter((v) => typeof v === 'string' && v.trim() !== '');
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed)
                return undefined;
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) {
                        return parsed.filter((v) => typeof v === 'string' && v.trim() !== '');
                    }
                }
                catch {
                }
            }
            if (trimmed.includes(',')) {
                return trimmed
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
            }
            return [trimmed];
        }
        return undefined;
    }),
    (0, class_validator_1.IsArray)({ message: 'existingImages must be an array of URL strings' }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateJewelleryDto.prototype, "existingImages", void 0);
class JewelleryQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.JewelleryQueryDto = JewelleryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], JewelleryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], JewelleryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by name or description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JewelleryQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by jewellery type (e.g. Gold, Silver)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JewelleryQueryDto.prototype, "jewelleryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by jewellery for (e.g. Men, Women, Unisex)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JewelleryQueryDto.prototype, "jewelleryFor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by publish status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], JewelleryQueryDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter only items with active discount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], JewelleryQueryDto.prototype, "hasDiscount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter only items with special occasion' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === 'true' || value === true)
            return true;
        if (value === 'false' || value === false)
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], JewelleryQueryDto.prototype, "hasSpecialOccasion", void 0);
class JewelleryResponseDto {
}
exports.JewelleryResponseDto = JewelleryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], JewelleryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '22K Royal Gold Kundan Necklace' }),
    __metadata("design:type", String)
], JewelleryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Handcrafted necklace' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85000 }),
    __metadata("design:type", Number)
], JewelleryResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://bucket.s3.amazonaws.com/image1.jpg' }),
    __metadata("design:type", String)
], JewelleryResponseDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['https://bucket.s3.amazonaws.com/image1.jpg'] }),
    __metadata("design:type", Array)
], JewelleryResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gold' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "jewelleryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '15.5 gram' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '22K' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "purity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Women' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "jewelleryFor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], JewelleryResponseDto.prototype, "hasSpecialOccasion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Wedding' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "specialOccasionName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-11-12T00:00:00.000Z' }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "specialOccasionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], JewelleryResponseDto.prototype, "hasDiscount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 76500 }),
    __metadata("design:type", Object)
], JewelleryResponseDto.prototype, "discountPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], JewelleryResponseDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-03T10:00:00.000Z' }),
    __metadata("design:type", Date)
], JewelleryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-03T10:00:00.000Z' }),
    __metadata("design:type", Date)
], JewelleryResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=jewellery.dto.js.map