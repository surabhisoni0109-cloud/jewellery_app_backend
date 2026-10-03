import { PrismaService } from './prisma.service';
import { FirebaseService, PushNotificationPayload } from './firebase.service';
import { RegisterDeviceTokenDto, NotificationQueryDto } from '../dto/notification.dto';
export declare class NotificationService {
    private readonly prisma;
    private readonly firebaseService;
    private readonly logger;
    constructor(prisma: PrismaService, firebaseService: FirebaseService);
    registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        platform: import(".prisma/client").$Enums.DevicePlatform;
        deviceId: string | null;
        isActive: boolean;
    }>;
    removeDeviceToken(token: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendToUser(userId: string, payload: PushNotificationPayload, saveToHistory?: boolean): Promise<{
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
    }>;
    sendToUsers(userIds: string[], payload: PushNotificationPayload, saveToHistory?: boolean): Promise<{
        success: boolean;
        sentCount: number;
        targetUsers: number;
        failureCount?: undefined;
    } | {
        success: boolean;
        targetUsers: number;
        sentCount: number;
        failureCount: number;
    }>;
    sendToTopic(topic: string, payload: PushNotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendDirectToToken(token: string, payload: PushNotificationPayload): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
        isTokenInvalid?: boolean;
    }>;
    getUserNotifications(userId: string, query: NotificationQueryDto): Promise<{
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
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        imageUrl: string | null;
        body: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        updatedCount: number;
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<number>;
}
