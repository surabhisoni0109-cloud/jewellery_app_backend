import { NotificationService } from '../services/notification.service';
import { RegisterDeviceTokenDto, RemoveDeviceTokenDto, SendTestNotificationDto, NotificationQueryDto } from '../dto/notification.dto';
import { User } from '@prisma/client';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    registerToken(user: User, dto: RegisterDeviceTokenDto): Promise<{
        message: string;
        data: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            token: string;
            platform: import(".prisma/client").$Enums.DevicePlatform;
            deviceId: string | null;
            isActive: boolean;
        };
    }>;
    removeToken(user: User, dto: RemoveDeviceTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getNotifications(user: User, query: NotificationQueryDto): Promise<{
        notifications: {
            id: string;
            userId: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            imageUrl: string | null;
            body: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(user: User): Promise<{
        unreadCount: number;
    }>;
    markAsRead(user: User, notificationId: string): Promise<{
        message: string;
        data: {
            id: string;
            userId: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            imageUrl: string | null;
            body: string;
            isRead: boolean;
            readAt: Date | null;
        };
    }>;
    markAllAsRead(user: User): Promise<{
        success: boolean;
        updatedCount: number;
        message: string;
    }>;
    sendTestNotification(dto: SendTestNotificationDto): Promise<{
        message: string;
        result: {
            success: boolean;
            sentCount: number;
            notification: {
                id: string;
                userId: string;
                createdAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                title: string;
                imageUrl: string | null;
                body: string;
                isRead: boolean;
                readAt: Date | null;
            } | null;
            message: string;
            failureCount?: undefined;
        } | {
            success: boolean;
            sentCount: number;
            failureCount: number;
            notification: {
                id: string;
                userId: string;
                createdAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                title: string;
                imageUrl: string | null;
                body: string;
                isRead: boolean;
                readAt: Date | null;
            } | null;
            message?: undefined;
        };
        success?: undefined;
    } | {
        message: string;
        result: {
            success: boolean;
            messageId?: string;
            error?: string;
        };
        success?: undefined;
    } | {
        message: string;
        success: boolean;
        result?: undefined;
    }>;
}
