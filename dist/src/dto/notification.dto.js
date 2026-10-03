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
exports.NotificationListResponseDto = exports.NotificationItemDto = exports.NotificationQueryDto = exports.SendTestNotificationDto = exports.RemoveDeviceTokenDto = exports.RegisterDeviceTokenDto = exports.DevicePlatformEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var DevicePlatformEnum;
(function (DevicePlatformEnum) {
    DevicePlatformEnum["ANDROID"] = "ANDROID";
    DevicePlatformEnum["IOS"] = "IOS";
    DevicePlatformEnum["WEB"] = "WEB";
})(DevicePlatformEnum || (exports.DevicePlatformEnum = DevicePlatformEnum = {}));
class RegisterDeviceTokenDto {
    constructor() {
        this.platform = DevicePlatformEnum.ANDROID;
    }
}
exports.RegisterDeviceTokenDto = RegisterDeviceTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Firebase Cloud Messaging (FCM) registration token',
        example: 'f8dJk7_example_fcm_token_xyz123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token cannot be empty' }),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Device operating system platform',
        enum: DevicePlatformEnum,
        default: DevicePlatformEnum.ANDROID,
        example: DevicePlatformEnum.ANDROID,
    }),
    (0, class_validator_1.IsEnum)(DevicePlatformEnum, {
        message: 'Platform must be ANDROID, IOS, or WEB',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Unique client device UUID or hardware identifier',
        example: 'c2b4d45e-881b-4f4d-b3b3-8c4d29f8f2b1',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDeviceTokenDto.prototype, "deviceId", void 0);
class RemoveDeviceTokenDto {
}
exports.RemoveDeviceTokenDto = RemoveDeviceTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Firebase Cloud Messaging (FCM) token to unregister',
        example: 'f8dJk7_example_fcm_token_xyz123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token cannot be empty' }),
    __metadata("design:type", String)
], RemoveDeviceTokenDto.prototype, "token", void 0);
class SendTestNotificationDto {
}
exports.SendTestNotificationDto = SendTestNotificationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target User ID (e.g. USR100001). Sends to all active devices registered to this user.',
        example: 'USR100001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target specific FCM registration token directly',
        example: 'f8dJk7_example_fcm_token_xyz123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Target FCM topic (e.g. "promotions", "all_vendors")',
        example: 'all_users',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "topic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification title',
        example: 'Special Offer Just For You!',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Notification body text',
        example: 'Get 20% off on your first handcrafted jewellery enquiry today.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Body is required' }),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional image URL to display with rich push notification',
        example: 'https://example.com/images/banner.jpg',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTestNotificationDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom key-value string payload for in-app navigation or action handling',
        example: { screen: 'EnquiryDetails', enquiryId: 'ENQ12345' },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendTestNotificationDto.prototype, "data", void 0);
class NotificationQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.NotificationQueryDto = NotificationQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], NotificationQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        default: 20,
        minimum: 1,
        maximum: 100,
        description: 'Number of notifications per page',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], NotificationQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by read status: true for read, false for unread',
    }),
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
], NotificationQueryDto.prototype, "isRead", void 0);
class NotificationItemDto {
}
exports.NotificationItemDto = NotificationItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], NotificationItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USR100001' }),
    __metadata("design:type", String)
], NotificationItemDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New Enquiry Received' }),
    __metadata("design:type", String)
], NotificationItemDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe is inquiring about Diamond Ring.' }),
    __metadata("design:type", String)
], NotificationItemDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { screen: 'EnquiryDetails', enquiryId: 'ENQ123' } }),
    __metadata("design:type", Object)
], NotificationItemDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/image.png' }),
    __metadata("design:type", Object)
], NotificationItemDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], NotificationItemDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-03T10:00:00.000Z' }),
    __metadata("design:type", Object)
], NotificationItemDto.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-03T09:45:00.000Z' }),
    __metadata("design:type", Date)
], NotificationItemDto.prototype, "createdAt", void 0);
class NotificationListResponseDto {
}
exports.NotificationListResponseDto = NotificationListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [NotificationItemDto] }),
    __metadata("design:type", Array)
], NotificationListResponseDto.prototype, "notifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45 }),
    __metadata("design:type", Number)
], NotificationListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], NotificationListResponseDto.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], NotificationListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 20 }),
    __metadata("design:type", Number)
], NotificationListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], NotificationListResponseDto.prototype, "totalPages", void 0);
//# sourceMappingURL=notification.dto.js.map