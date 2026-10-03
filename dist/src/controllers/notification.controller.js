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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("../services/notification.service");
const notification_dto_1 = require("../dto/notification.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async registerToken(user, dto) {
        const deviceToken = await this.notificationService.registerDeviceToken(user.userId, dto);
        return {
            message: 'Device token registered successfully',
            data: deviceToken,
        };
    }
    async removeToken(user, dto) {
        return this.notificationService.removeDeviceToken(dto.token, user.userId);
    }
    async getNotifications(user, query) {
        return this.notificationService.getUserNotifications(user.userId, query);
    }
    async getUnreadCount(user) {
        const count = await this.notificationService.getUnreadCount(user.userId);
        return {
            unreadCount: count,
        };
    }
    async markAsRead(user, notificationId) {
        const updated = await this.notificationService.markAsRead(user.userId, notificationId);
        return {
            message: 'Notification marked as read',
            data: updated,
        };
    }
    async markAllAsRead(user) {
        return this.notificationService.markAllAsRead(user.userId);
    }
    async sendTestNotification(dto) {
        const payload = {
            title: dto.title,
            body: dto.body,
            imageUrl: dto.imageUrl,
            data: dto.data,
        };
        if (dto.token) {
            const result = await this.notificationService.sendDirectToToken(dto.token, payload);
            return {
                message: 'Test notification sent directly to token',
                result,
            };
        }
        if (dto.userId) {
            const result = await this.notificationService.sendToUser(dto.userId, payload, true);
            return {
                message: `Test notification sent to user ${dto.userId}`,
                result,
            };
        }
        if (dto.topic) {
            const result = await this.notificationService.sendToTopic(dto.topic, payload);
            return {
                message: `Test notification sent to topic ${dto.topic}`,
                result,
            };
        }
        return {
            message: 'Please specify at least one target: "userId", "token", or "topic".',
            success: false,
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Register or refresh FCM device token',
        description: 'Associates a Firebase Cloud Messaging registration token with the authenticated user and platform (ANDROID, IOS, WEB).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Device token registered successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized access',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.RegisterDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "registerToken", null);
__decorate([
    (0, common_1.Delete)('token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Unregister FCM device token',
        description: 'Removes the device token upon user logout so push notifications are no longer dispatched to this device.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Device token removed successfully',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.RemoveDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "removeToken", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get notification inbox/history',
        description: 'Fetches paginated notification records for the authenticated user, with optional filter by read status.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(notification_dto_1.NotificationListResponseDto, 200, 'Notifications retrieved successfully'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.NotificationQueryDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get unread notification count',
        description: 'Returns the total count of unread notifications for notification badge display.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark a notification as read',
        description: 'Updates a specific notification status to read.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark all notifications as read',
        description: 'Marks all unread notifications for the user as read.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Post)('send-test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Test push notification dispatching',
        description: 'Sends a test push notification to a specified userId, FCM token, or FCM topic. Useful for verifying setup before implementing business events.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Test notification triggered successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.SendTestNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendTestNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map