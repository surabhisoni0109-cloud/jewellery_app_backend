import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { FirebaseService, PushNotificationPayload } from './firebase.service';
import {
  RegisterDeviceTokenDto,
  NotificationQueryDto,
} from '../dto/notification.dto';
import { CustomException } from '../common/exceptions/custom-exception';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Register or update a device token for a user.
   */
  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    try {
      const deviceToken = await this.prisma.deviceToken.upsert({
        where: { token: dto.token },
        update: {
          userId,
          platform: dto.platform as any,
          deviceId: dto.deviceId || null,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          userId,
          token: dto.token,
          platform: dto.platform as any,
          deviceId: dto.deviceId || null,
          isActive: true,
        },
      });

      this.logger.log(
        `Registered device token for user ${userId} on platform ${dto.platform}`,
      );
      return deviceToken;
    } catch (error: any) {
      this.logger.error(
        `Failed to register device token for user ${userId}: ${error.message}`,
      );
      throw new CustomException(
        'Failed to register device token',
        'TOKEN_REGISTRATION_FAILED',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Unregister / remove a device token (e.g. on logout).
   */
  async removeDeviceToken(token: string, userId?: string) {
    try {
      await this.prisma.deviceToken.deleteMany({
        where: {
          token,
          ...(userId ? { userId } : {}),
        },
      });

      this.logger.log(`Unregistered device token: ${token}`);
      return { success: true, message: 'Device token removed successfully' };
    } catch (error: any) {
      this.logger.error(
        `Failed to remove device token: ${error.message}`,
      );
      throw new CustomException(
        'Failed to remove device token',
        'TOKEN_REMOVAL_FAILED',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send notification to a specific user across all their registered active devices.
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
    saveToHistory: boolean = true,
  ) {
    let notificationRecord = null;

    // 1. Save notification record in database if requested
    if (saveToHistory) {
      try {
        notificationRecord = await this.prisma.notification.create({
          data: {
            userId,
            title: payload.title,
            body: payload.body,
            data: payload.data ? (payload.data as any) : undefined,
            imageUrl: payload.imageUrl || null,
          },
        });
      } catch (dbErr: any) {
        this.logger.error(
          `Failed to save notification record for user ${userId}: ${dbErr.message}`,
        );
      }
    }

    // 2. Fetch user's active device tokens
    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        token: true,
      },
    });

    if (deviceTokens.length === 0) {
      this.logger.log(
        `User ${userId} has no active device tokens registered. Notification recorded in database only.`,
      );
      return {
        success: true,
        sentCount: 0,
        notification: notificationRecord,
        message: 'No active device tokens found for user',
      };
    }

    const tokenList = deviceTokens.map((d) => d.token);

    // 3. Dispatch multicast push via Firebase
    const sendResult = await this.firebaseService.sendMulticast(
      tokenList,
      payload,
    );

    // 4. Mark invalid tokens inactive if any failed due to deregistration
    if (sendResult.invalidTokens.length > 0) {
      await this.prisma.deviceToken.updateMany({
        where: {
          token: { in: sendResult.invalidTokens },
        },
        data: {
          isActive: false,
        },
      });
      this.logger.log(
        `Deactivated ${sendResult.invalidTokens.length} expired/invalid device tokens for user ${userId}`,
      );
    }

    return {
      success: true,
      sentCount: sendResult.successCount,
      failureCount: sendResult.failureCount,
      notification: notificationRecord,
    };
  }

  /**
   * Send notification to multiple users.
   */
  async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload,
    saveToHistory: boolean = true,
  ) {
    if (!userIds || userIds.length === 0) {
      return { success: true, sentCount: 0, targetUsers: 0 };
    }

    // Save notification records in bulk
    if (saveToHistory) {
      const records = userIds.map((userId) => ({
        userId,
        title: payload.title,
        body: payload.body,
        data: payload.data ? (payload.data as any) : undefined,
        imageUrl: payload.imageUrl || null,
      }));

      await this.prisma.notification.createMany({
        data: records,
      });
    }

    // Fetch tokens for all users
    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
      },
      select: {
        token: true,
      },
    });

    if (deviceTokens.length === 0) {
      return { success: true, sentCount: 0, targetUsers: userIds.length };
    }

    const tokenList = deviceTokens.map((d) => d.token);
    const sendResult = await this.firebaseService.sendMulticast(
      tokenList,
      payload,
    );

    if (sendResult.invalidTokens.length > 0) {
      await this.prisma.deviceToken.updateMany({
        where: {
          token: { in: sendResult.invalidTokens },
        },
        data: {
          isActive: false,
        },
      });
    }

    return {
      success: true,
      targetUsers: userIds.length,
      sentCount: sendResult.successCount,
      failureCount: sendResult.failureCount,
    };
  }

  /**
   * Send notification to a specific FCM topic.
   */
  async sendToTopic(topic: string, payload: PushNotificationPayload) {
    return this.firebaseService.sendToTopic(topic, payload);
  }

  /**
   * Send notification directly to a single token.
   */
  async sendDirectToToken(token: string, payload: PushNotificationPayload) {
    return this.firebaseService.sendToDevice(token, payload);
  }

  /**
   * Retrieve notification history for a user with pagination and optional read filter.
   */
  async getUserNotifications(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, isRead } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new CustomException(
        'Notification not found',
        'NOTIFICATION_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      updatedCount: result.count,
      message: 'All notifications marked as read',
    };
  }

  /**
   * Get unread notifications count for a user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
