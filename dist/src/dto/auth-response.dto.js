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
exports.RefreshTokenResponseDto = exports.AuthSessionResponseDto = exports.OtpResponseDto = exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class UserResponseDto {
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Internal UUID' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USR123456', description: 'Public identifier (USR123456 or VND123456)' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.UserType, example: 'USER' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yogesh' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kumawat' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'yogesh@example.com' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.UserStatus, example: 'ACTIVE' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isMobileVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-20T15:45:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-20T15:45:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether onboarding is completed (always true for regular buyers, progress tracked for vendors)',
    }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isOnboarded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.OnboardingStep,
        example: 'PENDING',
        description: 'Current onboarding progress step (PENDING, STEP_1_DONE, STEP_2_DONE, COMPLETED)',
    }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "onboardingStep", void 0);
class OtpResponseDto {
}
exports.OtpResponseDto = OtpResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210' }),
    __metadata("design:type", String)
], OtpResponseDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-09-20T15:50:00.000Z', description: 'Expiration ISO timestamp' }),
    __metadata("design:type", String)
], OtpResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123456',
        description: 'development only, present only when EXPOSE_OTP_IN_RESPONSE=true',
    }),
    __metadata("design:type", String)
], OtpResponseDto.prototype, "devOtp", void 0);
class AuthSessionResponseDto {
}
exports.AuthSessionResponseDto = AuthSessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USR123456' }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user' }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yogesh' }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kumawat' }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9876543210' }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'yogesh@example.com' }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT Bearer Access Token',
    }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT Bearer Refresh Token',
    }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Whether onboarding is completed (always true for regular buyers, progress tracked for vendors)',
    }),
    __metadata("design:type", Boolean)
], AuthSessionResponseDto.prototype, "isOnboarded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.OnboardingStep,
        example: 'PENDING',
        description: 'Current onboarding progress step (PENDING, STEP_1_DONE, STEP_2_DONE, COMPLETED)',
    }),
    __metadata("design:type", String)
], AuthSessionResponseDto.prototype, "onboardingStep", void 0);
class RefreshTokenResponseDto {
}
exports.RefreshTokenResponseDto = RefreshTokenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Fresh JWT Bearer Access Token',
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Rotated JWT Bearer Refresh Token',
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Bearer',
        description: 'Token type',
    }),
    __metadata("design:type", String)
], RefreshTokenResponseDto.prototype, "tokenType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 900,
        description: 'Access token expiration in seconds',
    }),
    __metadata("design:type", Number)
], RefreshTokenResponseDto.prototype, "expiresIn", void 0);
//# sourceMappingURL=auth-response.dto.js.map