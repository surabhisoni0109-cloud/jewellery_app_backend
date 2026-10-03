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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const firebase_service_1 = require("./firebase.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma, firebaseService) {
        this.prisma = prisma;
        this.firebaseService = firebaseService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async registerDeviceToken(userId, dto) {
        try {
            const deviceToken = await this.prisma.deviceToken.upsert({
                where: { token: dto.token },
                update: {
                    userId,
                    platform: dto.platform,
                    deviceId: dto.deviceId || null,
                    isActive: true,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    token: dto.token,
                    platform: dto.platform,
                    deviceId: dto.deviceId || null,
                    isActive: true,
                },
            });
            this.logger.log(`Registered device token for user ${userId} on platform ${dto.platform}`);
            return deviceToken;
        }
        catch (error) {
            this.logger.error(`Failed to register device token for user ${userId}: ${error.message}`);
            throw new custom_exception_1.CustomException('Failed to register device token', 'TOKEN_REGISTRATION_FAILED', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async removeDeviceToken(token, userId) {
        try {
            await this.prisma.deviceToken.deleteMany({
                where: {
                    token,
                    ...(userId ? { userId } : {}),
                },
            });
            this.logger.log(`Unregistered device token: ${token}`);
            return { success: true, message: 'Device token removed successfully' };
        }
        catch (error) {
            this.logger.error(`Failed to remove device token: ${error.message}`);
            throw new custom_exception_1.CustomException('Failed to remove device token', 'TOKEN_REMOVAL_FAILED', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendToUser(userId, payload, saveToHistory = true) {
        let notificationRecord = null;
        if (saveToHistory) {
            try {
                notificationRecord = await this.prisma.notification.create({
                    data: {
                        userId,
                        title: payload.title,
                        body: payload.body,
                        data: payload.data ? payload.data : undefined,
                        imageUrl: payload.imageUrl || null,
                    },
                });
            }
            catch (dbErr) {
                this.logger.error(`Failed to save notification record for user ${userId}: ${dbErr.message}`);
            }
        }
        const deviceTokens = await this.prisma.deviceToken.findMany({
            where: {
                userId,
                isActive: true,
            },
            select: {
                token: true,
            },
        });
        if (deviceTokens.length === 0) {
            this.logger.log(`User ${userId} has no active device tokens registered. Notification recorded in database only.`);
            return {
                success: true,
                sentCount: 0,
                notification: notificationRecord,
                message: 'No active device tokens found for user',
            };
        }
        const tokenList = deviceTokens.map((d) => d.token);
        const sendResult = await this.firebaseService.sendMulticast(tokenList, payload);
        if (sendResult.invalidTokens.length > 0) {
            await this.prisma.deviceToken.updateMany({
                where: {
                    token: { in: sendResult.invalidTokens },
                },
                data: {
                    isActive: false,
                },
            });
            this.logger.log(`Deactivated ${sendResult.invalidTokens.length} expired/invalid device tokens for user ${userId}`);
        }
        return {
            success: true,
            sentCount: sendResult.successCount,
            failureCount: sendResult.failureCount,
            notification: notificationRecord,
        };
    }
    async sendToUsers(userIds, payload, saveToHistory = true) {
        if (!userIds || userIds.length === 0) {
            return { success: true, sentCount: 0, targetUsers: 0 };
        }
        if (saveToHistory) {
            const records = userIds.map((userId) => ({
                userId,
                title: payload.title,
                body: payload.body,
                data: payload.data ? payload.data : undefined,
                imageUrl: payload.imageUrl || null,
            }));
            await this.prisma.notification.createMany({
                data: records,
            });
        }
        const deviceTokens = await this.prisma.deviceToken.findMany({
            where: {
                userId: { in: userIds },
                isActive: true,
            },
            select: {
                token: true,
            },
        });
        if (deviceTokens.length === 0) {
            return { success: true, sentCount: 0, targetUsers: userIds.length };
        }
        const tokenList = deviceTokens.map((d) => d.token);
        const sendResult = await this.firebaseService.sendMulticast(tokenList, payload);
        if (sendResult.invalidTokens.length > 0) {
            await this.prisma.deviceToken.updateMany({
                where: {
                    token: { in: sendResult.invalidTokens },
                },
                data: {
                    isActive: false,
                },
            });
        }
        return {
            success: true,
            targetUsers: userIds.length,
            sentCount: sendResult.successCount,
            failureCount: sendResult.failureCount,
        };
    }
    async sendToTopic(topic, payload) {
        return this.firebaseService.sendToTopic(topic, payload);
    }
    async sendDirectToToken(token, payload) {
        return this.firebaseService.sendToDevice(token, payload);
    }
    async getUserNotifications(userId, query) {
        const { page = 1, limit = 20, isRead } = query;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (isRead !== undefined) {
            where.isRead = isRead;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            notifications,
            total,
            unreadCount,
            page,
            limit,
            totalPages,
        };
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new custom_exception_1.CustomException('Notification not found', 'NOTIFICATION_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
        return {
            success: true,
            updatedCount: result.count,
            message: 'All notifications marked as read',
        };
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        firebase_service_1.FirebaseService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map