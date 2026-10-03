export declare enum DevicePlatformEnum {
    ANDROID = "ANDROID",
    IOS = "IOS",
    WEB = "WEB"
}
export declare class RegisterDeviceTokenDto {
    token: string;
    platform: DevicePlatformEnum;
    deviceId?: string;
}
export declare class RemoveDeviceTokenDto {
    token: string;
}
export declare class SendTestNotificationDto {
    userId?: string;
    token?: string;
    topic?: string;
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, string>;
}
export declare class NotificationQueryDto {
    page: number;
    limit: number;
    isRead?: boolean;
}
export declare class NotificationItemDto {
    id: string;
    userId: string;
    title: string;
    body: string;
    data?: any;
    imageUrl?: string | null;
    isRead: boolean;
    readAt?: Date | null;
    createdAt: Date;
}
export declare class NotificationListResponseDto {
    notifications: NotificationItemDto[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
}
