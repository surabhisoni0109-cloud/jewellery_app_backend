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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("./prisma.service");
const s3_service_1 = require("./s3.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let AdminService = class AdminService {
    constructor(prisma, jwtService, configService, s3Service) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.s3Service = s3Service;
    }
    async login(dto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (!admin) {
            throw new custom_exception_1.CustomException('Invalid email or password', 'INVALID_CREDENTIALS', common_1.HttpStatus.UNAUTHORIZED);
        }
        const passwordMatch = await bcrypt.compare(dto.password, admin.password);
        if (!passwordMatch) {
            throw new custom_exception_1.CustomException('Invalid email or password', 'INVALID_CREDENTIALS', common_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = { sub: admin.id, email: admin.email, type: 'admin' };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ADMIN_SECRET', 'admin_fallback_secret_min_32_chars_long'),
            expiresIn: this.configService.get('JWT_ADMIN_EXPIRES_IN', '7d'),
        });
        return {
            access_token: token,
            admin: this.sanitizeAdmin(admin),
        };
    }
    async getMe(adminId) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId },
        });
        if (!admin) {
            throw new custom_exception_1.CustomException('Admin not found', 'NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        return this.sanitizeAdmin(admin);
    }
    async updateProfile(adminId, dto, avatarFile) {
        let avatarUrl;
        if (avatarFile) {
            this.s3Service.validateFile(avatarFile);
            const ext = avatarFile.originalname.split('.').pop() ?? 'jpg';
            const key = `admins/${adminId}/avatar.${ext}`;
            const existing = await this.prisma.admin.findUnique({
                where: { id: adminId },
                select: { avatar: true },
            });
            if (existing?.avatar) {
                await this.s3Service.deleteFileByUrl(existing.avatar).catch(() => { });
            }
            avatarUrl = await this.s3Service.uploadFile(avatarFile, key);
        }
        if (dto.email) {
            const emailTaken = await this.prisma.admin.findFirst({
                where: { email: dto.email.toLowerCase().trim(), NOT: { id: adminId } },
            });
            if (emailTaken) {
                throw new custom_exception_1.CustomException('This email is already in use', 'EMAIL_TAKEN', common_1.HttpStatus.CONFLICT);
            }
        }
        const updated = await this.prisma.admin.update({
            where: { id: adminId },
            data: {
                ...(dto.name && { name: dto.name.trim() }),
                ...(dto.email && { email: dto.email.toLowerCase().trim() }),
                ...(avatarUrl !== undefined && { avatar: avatarUrl }),
            },
        });
        return this.sanitizeAdmin(updated);
    }
    async changePassword(adminId, dto) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId },
        });
        if (!admin) {
            throw new custom_exception_1.CustomException('Admin not found', 'NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const match = await bcrypt.compare(dto.currentPassword, admin.password);
        if (!match) {
            throw new custom_exception_1.CustomException('Current password is incorrect', 'INVALID_CREDENTIALS', common_1.HttpStatus.BAD_REQUEST);
        }
        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.admin.update({
            where: { id: adminId },
            data: { password: hashed },
        });
        return { message: 'Password updated successfully' };
    }
    async getDashboardStats() {
        const [totalUsers, totalVendors] = await Promise.all([
            this.prisma.user.count({ where: { type: 'USER' } }),
            this.prisma.user.count({ where: { type: 'VENDOR' } }),
        ]);
        return { totalUsers, totalVendors };
    }
    async getUsers(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = { type: 'USER' };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { mobileNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async toggleUserStatus(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.type !== 'USER') {
            throw new custom_exception_1.CustomException('User not found', 'NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { status: newStatus },
        });
        return updated;
    }
    async getVendors(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = { type: 'VENDOR' };
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { mobileNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [vendors, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: vendors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async toggleVendorStatus(vendorId) {
        const vendor = await this.prisma.user.findUnique({ where: { id: vendorId } });
        if (!vendor || vendor.type !== 'VENDOR') {
            throw new custom_exception_1.CustomException('Vendor not found', 'NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const newStatus = vendor.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        const updated = await this.prisma.user.update({
            where: { id: vendorId },
            data: { status: newStatus },
        });
        return updated;
    }
    sanitizeAdmin(admin) {
        const { password, ...safe } = admin;
        return safe;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        s3_service_1.S3Service])
], AdminService);
//# sourceMappingURL=admin.service.js.map