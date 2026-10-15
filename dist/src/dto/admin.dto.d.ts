export declare class AdminLoginDto {
    email: string;
    password: string;
}
export declare class AdminUpdateProfileDto {
    name?: string;
    email?: string;
}
export declare class AdminChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AdminBroadcastNotificationDto {
    title: string;
    body: string;
    targets: ('USER' | 'VENDOR')[];
    imageUrl?: string;
}
