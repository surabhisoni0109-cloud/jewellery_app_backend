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
exports.FavoriteStoresQueryDto = exports.ToggleFavoriteResponseDto = exports.CreateStoreEnquiryDto = exports.CreateStoreRatingDto = exports.StoreReviewItemDto = exports.StoreRatingsQueryDto = exports.StoreJewelleryItemDto = exports.StoreJewelleryQueryDto = exports.StoreDetailsDto = exports.RatingSummaryDto = exports.StoreListItemDto = exports.StoreQueryDto = exports.StoreSortBy = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var StoreSortBy;
(function (StoreSortBy) {
    StoreSortBy["DISTANCE"] = "distance";
    StoreSortBy["RATING"] = "rating";
    StoreSortBy["PRICE"] = "price";
    StoreSortBy["NEWEST"] = "newest";
})(StoreSortBy || (exports.StoreSortBy = StoreSortBy = {}));
class StoreQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.StoreQueryDto = StoreQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 28.6139, description: 'User current latitude (optional - automatically uses user profile location if logged in)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreQueryDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.209, description: 'User current longitude (optional - automatically uses user profile location if logged in)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreQueryDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'New Delhi', description: 'Filter stores by city (optional - defaults to user profile city if logged in)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreQueryDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Delhi', description: 'Filter stores by state' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreQueryDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '110005', description: 'Filter stores by pincode' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreQueryDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'VND100001', description: 'Search stores by store UUID, vendor ID (e.g. VND100001), store name, area, city, or description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: StoreSortBy, example: StoreSortBy.RATING, description: 'Sort criteria' }),
    (0, class_validator_1.IsEnum)(StoreSortBy),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, default: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreQueryDto.prototype, "limit", void 0);
class StoreListItemDto {
}
exports.StoreListItemDto = StoreListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-xxxx' }),
    __metadata("design:type", String)
], StoreListItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'VND100001' }),
    __metadata("design:type", String)
], StoreListItemDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Soni Jewellers' }),
    __metadata("design:type", String)
], StoreListItemDto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Handcrafted luxury jewellery', nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "storeDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/.../logo.jpg', nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "storeLogo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/.../cover-1.jpg', nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "storeCoverImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { city: 'New Delhi', area: 'Karol Bagh', pincode: '110005', state: 'Delhi' },
    }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.4, description: 'Distance in kilometers from user coordinates', nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "distanceKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.8 }),
    __metadata("design:type", Number)
], StoreListItemDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 28 }),
    __metadata("design:type", Number)
], StoreListItemDto.prototype, "totalReviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1500.0, nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "jewelleryStartingPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Whether the store is currently open based on current time and operating hours' }),
    __metadata("design:type", Boolean)
], StoreListItemDto.prototype, "isOpen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Whether the store is marked favorite by current user' }),
    __metadata("design:type", Boolean)
], StoreListItemDto.prototype, "isFavorite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00', nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "storeOpeningTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '20:30', nullable: true }),
    __metadata("design:type", Object)
], StoreListItemDto.prototype, "storeClosingTime", void 0);
class RatingSummaryDto {
}
exports.RatingSummaryDto = RatingSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4.8 }),
    __metadata("design:type", Number)
], RatingSummaryDto.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120 }),
    __metadata("design:type", Number)
], RatingSummaryDto.prototype, "totalReviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { 1: 2, 2: 3, 3: 10, 4: 25, 5: 80 },
        description: 'Star rating distribution counts',
    }),
    __metadata("design:type", Object)
], RatingSummaryDto.prototype, "distribution", void 0);
class StoreDetailsDto {
}
exports.StoreDetailsDto = StoreDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-xxxx' }),
    __metadata("design:type", String)
], StoreDetailsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'VND100001' }),
    __metadata("design:type", String)
], StoreDetailsDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Soni Jewellers' }),
    __metadata("design:type", String)
], StoreDetailsDto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Handcrafted luxury jewellery since 1985', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.amazonaws.com/.../logo.jpg', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeLogo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['https://s3.../cover1.jpg', 'https://s3.../cover2.jpg'] }),
    __metadata("design:type", Array)
], StoreDetailsDto.prototype, "storeCoverImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { addressLine1: '123 Gold St', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110005' } }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.4, nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "distanceKm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1500.0, nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "jewelleryStartingPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://soni-jewellers.com', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeWebsite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeContactNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Rahul Sharma', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeOwnerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "whatsappNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'contact@sonijewellers.com', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeOpeningTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '20:30', nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeClosingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1985, nullable: true }),
    __metadata("design:type", Object)
], StoreDetailsDto.prototype, "storeFoundedYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StoreDetailsDto.prototype, "isOpen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Whether the store is marked favorite by current user' }),
    __metadata("design:type", Boolean)
], StoreDetailsDto.prototype, "isFavorite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: RatingSummaryDto }),
    __metadata("design:type", RatingSummaryDto)
], StoreDetailsDto.prototype, "ratingSummary", void 0);
class StoreJewelleryQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.StoreJewelleryQueryDto = StoreJewelleryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ring', description: 'Filter by jewellery type (e.g. Ring, Necklace, Bangle)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreJewelleryQueryDto.prototype, "jewelleryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'FEMALE', description: 'Filter by target gender' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreJewelleryQueryDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Filter items with active discount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    __metadata("design:type", Boolean)
], StoreJewelleryQueryDto.prototype, "hasDiscount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Filter items marked for special occasion' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    __metadata("design:type", Boolean)
], StoreJewelleryQueryDto.prototype, "hasSpecialOccasion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gold', description: 'Search jewellery by title or description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreJewelleryQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreJewelleryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, default: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreJewelleryQueryDto.prototype, "limit", void 0);
class StoreJewelleryItemDto {
}
exports.StoreJewelleryItemDto = StoreJewelleryItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-xxxx' }),
    __metadata("design:type", String)
], StoreJewelleryItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kundan Diamond Necklace' }),
    __metadata("design:type", String)
], StoreJewelleryItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Handmade 22K kundan piece', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45000.0 }),
    __metadata("design:type", Number)
], StoreJewelleryItemDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.../jewellery-main.jpg' }),
    __metadata("design:type", String)
], StoreJewelleryItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['https://s3.../img1.jpg', 'https://s3.../img2.jpg'] }),
    __metadata("design:type", Array)
], StoreJewelleryItemDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Necklace', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "jewelleryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '35g', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '22K', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "purity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FEMALE', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StoreJewelleryItemDto.prototype, "hasDiscount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.0, nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40500.0, nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "discountPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], StoreJewelleryItemDto.prototype, "hasSpecialOccasion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Diwali', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "specialOccasionName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-11-01', nullable: true }),
    __metadata("design:type", Object)
], StoreJewelleryItemDto.prototype, "specialOccasionDate", void 0);
class StoreRatingsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.StoreRatingsQueryDto = StoreRatingsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, description: 'Filter reviews by specific star rating (1 to 5)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreRatingsQueryDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreRatingsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, default: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreRatingsQueryDto.prototype, "limit", void 0);
class StoreReviewItemDto {
}
exports.StoreReviewItemDto = StoreReviewItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-xxxx' }),
    __metadata("design:type", String)
], StoreReviewItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USR100001', nullable: true }),
    __metadata("design:type", Object)
], StoreReviewItemDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Priya Verma' }),
    __metadata("design:type", String)
], StoreReviewItemDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://s3.../profile.jpg', nullable: true }),
    __metadata("design:type", Object)
], StoreReviewItemDto.prototype, "customerProfileImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], StoreReviewItemDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Excellent craftsmanship and trusted quality!', nullable: true }),
    __metadata("design:type", Object)
], StoreReviewItemDto.prototype, "review", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-10T14:30:00.000Z' }),
    __metadata("design:type", String)
], StoreReviewItemDto.prototype, "createdAt", void 0);
class CreateStoreRatingDto {
}
exports.CreateStoreRatingDto = CreateStoreRatingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Star rating from 1 to 5', minimum: 1, maximum: 5 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'rating must be an integer between 1 and 5' }),
    (0, class_validator_1.Min)(1, { message: 'rating must be at least 1' }),
    (0, class_validator_1.Max)(5, { message: 'rating cannot exceed 5' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'rating is required' }),
    __metadata("design:type", Number)
], CreateStoreRatingDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Beautiful collection and great service!', description: 'Review comment (optional)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStoreRatingDto.prototype, "review", void 0);
class CreateStoreEnquiryDto {
}
exports.CreateStoreEnquiryDto = CreateStoreEnquiryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hello, I want to know if this necklace is available in 18K white gold?', description: 'Enquiry message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'message is required' }),
    __metadata("design:type", String)
], CreateStoreEnquiryDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-jewellery-id', description: 'Optional ID of specific jewellery item being enquired about' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStoreEnquiryDto.prototype, "jewelleryId", void 0);
class ToggleFavoriteResponseDto {
}
exports.ToggleFavoriteResponseDto = ToggleFavoriteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Whether the store is now in favorites' }),
    __metadata("design:type", Boolean)
], ToggleFavoriteResponseDto.prototype, "isFavorite", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Store added to favorites' }),
    __metadata("design:type", String)
], ToggleFavoriteResponseDto.prototype, "message", void 0);
class FavoriteStoresQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.FavoriteStoresQueryDto = FavoriteStoresQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 28.6139, description: 'User current latitude (optional - automatically uses user profile location if logged in)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FavoriteStoresQueryDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 77.209, description: 'User current longitude (optional - automatically uses user profile location if logged in)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FavoriteStoresQueryDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, default: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FavoriteStoresQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, default: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FavoriteStoresQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=user-stores.dto.js.map