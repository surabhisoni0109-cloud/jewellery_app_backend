import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { AdminLoginDto, AdminUpdateProfileDto, AdminChangePasswordDto, AdminBroadcastNotificationDto } from '../dto/admin.dto';
import { NotificationService } from './notification.service';
export declare class AdminService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly s3Service;
    private readonly notificationService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, s3Service: S3Service, notificationService: NotificationService);
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
    getMe(adminId: string): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
    }>;
    updateProfile(adminId: string, dto: AdminUpdateProfileDto, avatarFile?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
    }>;
    changePassword(adminId: string, dto: AdminChangePasswordDto): Promise<{
        message: string;
    }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalVendors: number;
    }>;
    getUsers(page?: number, limit?: number, search?: string): Promise<{
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
    toggleUserStatus(userId: string): Promise<{
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
    getVendors(page?: number, limit?: number, search?: string): Promise<{
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
    toggleVendorStatus(vendorId: string): Promise<{
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
    broadcastNotification(dto: AdminBroadcastNotificationDto, imageFile?: Express.Multer.File): Promise<{
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
    getBroadcastHistory(page?: number, limit?: number): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private sanitizeAdmin;
}
