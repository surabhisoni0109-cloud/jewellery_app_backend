import { AdminService } from '../services/admin.service';
import { AdminLoginDto, AdminUpdateProfileDto, AdminChangePasswordDto, AdminBroadcastNotificationDto } from '../dto/admin.dto';
import { Admin } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(dto: AdminLoginDto): Promise<{
        access_token: string;
        admin: {
            name: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            avatar: string | null;
        };
    }>;
    getMe(admin: Admin): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
    }>;
    updateProfile(admin: Admin, dto: AdminUpdateProfileDto, avatar?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
    }>;
    changePassword(admin: Admin, dto: AdminChangePasswordDto): Promise<{
        message: string;
    }>;
    getDashboard(): Promise<{
        totalUsers: number;
        totalVendors: number;
    }>;
    getUsers(page: number, limit: number, search?: string): Promise<{
        data: {
            type: import(".prisma/client").$Enums.UserType;
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            mobileNumber: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
            isMobileVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    toggleUserStatus(id: string): Promise<{
        type: import(".prisma/client").$Enums.UserType;
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        mobileNumber: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        isMobileVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getVendors(page: number, limit: number, search?: string): Promise<{
        data: {
            type: import(".prisma/client").$Enums.UserType;
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            mobileNumber: string;
            email: string;
            status: import(".prisma/client").$Enums.UserStatus;
            isMobileVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    toggleVendorStatus(id: string): Promise<{
        type: import(".prisma/client").$Enums.UserType;
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        mobileNumber: string;
        email: string;
        status: import(".prisma/client").$Enums.UserStatus;
        isMobileVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadNotificationImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    broadcastNotification(dto: AdminBroadcastNotificationDto, image?: Express.Multer.File): Promise<{
        message: string;
        targetAudience: string;
        totalUsers: number;
        sentCount: number;
        failureCount: number;
    } | {
        success: boolean;
        sentCount: number;
        targetUsers: number;
        failureCount?: undefined;
        message: string;
        targetAudience: string;
        totalUsers: number;
    } | {
        success: boolean;
        targetUsers: number;
        sentCount: number;
        failureCount: number;
        message: string;
        targetAudience: string;
        totalUsers: number;
    }>;
    getBroadcastHistory(page: number, limit: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
