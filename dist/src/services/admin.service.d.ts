import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { AdminLoginDto, AdminUpdateProfileDto, AdminChangePasswordDto } from '../dto/admin.dto';
export declare class AdminService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly s3Service;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, s3Service: S3Service);
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
    private sanitizeAdmin;
}
