import {
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma.service';
import { S3Service } from './s3.service';
import { CustomException } from '../common/exceptions/custom-exception';
import {
  AdminLoginDto,
  AdminUpdateProfileDto,
  AdminChangePasswordDto,
} from '../dto/admin.dto';
import { Admin } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  // ── Auth ─────────────────────────────────────────────

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!admin) {
      throw new CustomException(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, admin.password);
    if (!passwordMatch) {
      throw new CustomException(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { sub: admin.id, email: admin.email, type: 'admin' };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'JWT_ADMIN_SECRET',
        'admin_fallback_secret_min_32_chars_long',
      ),
      expiresIn: this.configService.get<string>('JWT_ADMIN_EXPIRES_IN', '7d'),
    });

    return {
      access_token: token,
      admin: this.sanitizeAdmin(admin),
    };
  }

  async getMe(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new CustomException(
        'Admin not found',
        'NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.sanitizeAdmin(admin);
  }

  async updateProfile(
    adminId: string,
    dto: AdminUpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ) {
    let avatarUrl: string | undefined;

    if (avatarFile) {
      this.s3Service.validateFile(avatarFile);
      const ext = avatarFile.originalname.split('.').pop() ?? 'jpg';
      const key = `admins/${adminId}/avatar.${ext}`;

      // Delete old avatar if exists
      const existing = await this.prisma.admin.findUnique({
        where: { id: adminId },
        select: { avatar: true },
      });
      if (existing?.avatar) {
        await this.s3Service.deleteFileByUrl(existing.avatar).catch(() => {});
      }

      avatarUrl = await this.s3Service.uploadFile(avatarFile, key);
    }

    // Check email uniqueness if changing email
    if (dto.email) {
      const emailTaken = await this.prisma.admin.findFirst({
        where: { email: dto.email.toLowerCase().trim(), NOT: { id: adminId } },
      });
      if (emailTaken) {
        throw new CustomException(
          'This email is already in use',
          'EMAIL_TAKEN',
          HttpStatus.CONFLICT,
        );
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

  async changePassword(adminId: string, dto: AdminChangePasswordDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new CustomException('Admin not found', 'NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const match = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!match) {
      throw new CustomException(
        'Current password is incorrect',
        'INVALID_CREDENTIALS',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  // ── Dashboard ─────────────────────────────────────────

  async getDashboardStats() {
    const [totalUsers, totalVendors] = await Promise.all([
      this.prisma.user.count({ where: { type: 'USER' } }),
      this.prisma.user.count({ where: { type: 'VENDOR' } }),
    ]);

    return { totalUsers, totalVendors };
  }

  // ── Users ─────────────────────────────────────────────

  async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { type: 'USER' };

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

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.type !== 'USER') {
      throw new CustomException('User not found', 'NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return updated;
  }

  // ── Vendors ───────────────────────────────────────────

  async getVendors(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { type: 'VENDOR' };

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

  async toggleVendorStatus(vendorId: string) {
    const vendor = await this.prisma.user.findUnique({ where: { id: vendorId } });
    if (!vendor || vendor.type !== 'VENDOR') {
      throw new CustomException('Vendor not found', 'NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const newStatus = vendor.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const updated = await this.prisma.user.update({
      where: { id: vendorId },
      data: { status: newStatus },
    });

    return updated;
  }

  // ── Helpers ───────────────────────────────────────────

  private sanitizeAdmin(admin: Admin) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = admin;
    return safe;
  }
}
