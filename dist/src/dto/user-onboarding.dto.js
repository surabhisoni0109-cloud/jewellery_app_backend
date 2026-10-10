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
exports.UserOnboardingResponseDto = exports.UserOnboardingDto = exports.UserLocationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const min_age_validator_1 = require("../common/validators/min-age.validator");
class UserLocationDto {
}
exports.UserLocationDto = UserLocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 28.6139, description: 'Latitude (optional)', required: false }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserLocationDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 77.209, description: 'Longitude (optional)', required: false }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserLocationDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123, Gold Street', description: 'Address line 1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Near ABC Mall', description: 'Address line 2 (optional)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "addressLine2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Karol Bagh', description: 'Area / locality' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New Delhi', description: 'City' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Delhi', description: 'State' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'India', description: 'Country' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '110005', description: 'Pincode / postal code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserLocationDto.prototype, "pincode", void 0);
class UserOnboardingDto {
}
exports.UserOnboardingDto = UserOnboardingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Yogesh',
        description: 'First name of the user',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'firstName cannot be empty' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UserOnboardingDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Kumawat',
        description: 'Last name of the user',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'lastName cannot be empty' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UserOnboardingDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'yogesh@example.com',
        description: 'Email address of the user',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'email must be a valid email address' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], UserOnboardingDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '9876543210',
        description: 'Mobile number of the user (read-only, cannot be updated)',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UserOnboardingDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.Gender,
        example: 'MALE',
        description: 'User gender',
        required: true,
    }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value)),
    (0, class_validator_1.IsEnum)(client_1.Gender, { message: 'gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserOnboardingDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '1995-06-15',
        description: 'Date of birth in YYYY-MM-DD format. User must be at least 18 years old.',
        required: true,
    }),
    (0, class_validator_1.IsDateString)({}, { message: 'dob must be a valid ISO date string (YYYY-MM-DD)' }),
    (0, min_age_validator_1.IsMinAge)(18, { message: 'User must be at least 18 years old' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserOnboardingDto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User location as a JSON object or string',
        example: {
            latitude: 28.6139,
            longitude: 77.209,
            addressLine1: '123 Gold St',
            area: 'Karol Bagh',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            pincode: '110005',
        },
        required: true,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserLocationDto),
    __metadata("design:type", UserLocationDto)
], UserOnboardingDto.prototype, "location", void 0);
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
], UserOnboardingDto.prototype, "profilePicture", void 0);
class UserOnboardingResponseDto {
}
exports.UserOnboardingResponseDto = UserOnboardingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserOnboardingResponseDto.prototype, "isOnboarded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yogesh', nullable: true }),
    __metadata("design:type", String)
], UserOnboardingResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kumawat', nullable: true }),
    __metadata("design:type", String)
], UserOnboardingResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'yogesh@example.com', nullable: true }),
    __metadata("design:type", String)
], UserOnboardingResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210', nullable: true }),
    __metadata("design:type", String)
], UserOnboardingResponseDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MALE', enum: client_1.Gender, nullable: true }),
    __metadata("design:type", Object)
], UserOnboardingResponseDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1995-06-15', nullable: true }),
    __metadata("design:type", Object)
], UserOnboardingResponseDto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://s3.amazonaws.com/bucket/users/USR100001/profile.jpg',
        nullable: true,
    }),
    __metadata("design:type", Object)
], UserOnboardingResponseDto.prototype, "profilePicture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            latitude: 28.6139,
            longitude: 77.209,
            addressLine1: '123 Gold St',
            area: 'Karol Bagh',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            pincode: '110005',
        },
        nullable: true,
    }),
    __metadata("design:type", Object)
], UserOnboardingResponseDto.prototype, "location", void 0);
//# sourceMappingURL=user-onboarding.dto.js.map