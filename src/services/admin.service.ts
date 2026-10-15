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
  AdminBroadcastNotificationDto,
} from '../dto/admin.dto';
import { Admin, UserType } from '@prisma/client';
import { NotificationService } from './notification.service';
import { PushNotificationPayload } from './firebase.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly notificationService: NotificationService,
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

  // ── Broadcast Notifications ───────────────────────────

  async uploadNotificationImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new CustomException('No image file provided', 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    this.s3Service.validateFile(file);
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const fileName = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const s3Key = `notifications/${fileName}`;

    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const accessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID');

    if (bucket && accessKey) {
      try {
        const s3Url = await this.s3Service.uploadFile(file, s3Key);
        return { url: s3Url };
      } catch (err: any) {
        console.warn(`S3 upload failed, saving locally: ${err?.message}`);
      }
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'notifications');
    fs.mkdirSync(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const appUrl =
      this.configService.get<string>('APP_URL') ||
      `http://localhost:${this.configService.get<number>('PORT', 3000)}`;
    return { url: `${appUrl}/uploads/notifications/${fileName}` };
  }

  async broadcastNotification(
    dto: AdminBroadcastNotificationDto,
    imageFile?: Express.Multer.File,
  ) {
    if (!dto.targets || dto.targets.length === 0) {
      throw new CustomException(
        'At least one target audience (USER or VENDOR) must be selected',
        'VALIDATION_ERROR',
        HttpStatus.BAD_REQUEST,
      );
    }

    let finalImageUrl = dto.imageUrl?.trim() || undefined;
    if (imageFile) {
      const uploaded = await this.uploadNotificationImage(imageFile);
      finalImageUrl = uploaded.url;
    }

    const targetLabel =
      dto.targets.length === 2
        ? 'BOTH'
        : dto.targets[0] === 'USER'
          ? 'USERS'
          : 'VENDORS';

    // 1. Fetch matching active users
    const users = await this.prisma.user.findMany({
      where: {
        type: { in: dto.targets as UserType[] },
        status: 'ACTIVE',
      },
      select: { userId: true },
    });

    const userIds = users.map((u) => u.userId);

    if (userIds.length === 0) {
      return {
        message: 'No active users found for selected audience',
        targetAudience: targetLabel,
        totalUsers: 0,
        sentCount: 0,
        failureCount: 0,
      };
    }

    const payload: PushNotificationPayload = {
      title: dto.title.trim(),
      body: dto.body.trim(),
      imageUrl: finalImageUrl,
      data: {
        type: 'ADMIN_BROADCAST',
        targetAudience: targetLabel,
        createdAt: new Date().toISOString(),
      },
    };

    // 2. Dispatch via NotificationService
    const result = await this.notificationService.sendToUsers(
      userIds,
      payload,
      true,
    );

    return {
      message: 'Broadcast notification sent successfully',
      targetAudience: targetLabel,
      totalUsers: userIds.length,
      ...result,
    };
  }

  async getBroadcastHistory(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const notifications = await this.prisma.notification.findMany({
      where: {
        data: {
          path: ['type'],
          equals: 'ADMIN_BROADCAST',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const groupedMap = new Map<string, any>();
    for (const n of notifications) {
      const dataObj = (n.data as any) || {};
      const targetAudience = dataObj.targetAudience || 'ALL';
      const timeKey = Math.floor(new Date(n.createdAt).getTime() / 120000);
      const key = `${n.title}__${n.body}__${timeKey}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: n.id,
          title: n.title,
          body: n.body,
          imageUrl: n.imageUrl,
          targetAudience,
          createdAt: n.createdAt,
          recipientCount: 1,
        });
      } else {
        const item = groupedMap.get(key);
        item.recipientCount++;
      }
    }

    const allGrouped = Array.from(groupedMap.values());
    const paginated = allGrouped.slice(skip, skip + limit);

    return {
      data: paginated,
      meta: {
        total: allGrouped.length,
        page,
        limit,
        totalPages: Math.ceil(allGrouped.length / limit) || 1,
      },
    };
  }

  // ── Helpers ───────────────────────────────────────────

  private sanitizeAdmin(admin: Admin) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = admin;
    return safe;
  }
}
