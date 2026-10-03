import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import {
  RegisterDeviceTokenDto,
  RemoveDeviceTokenDto,
  SendTestNotificationDto,
  NotificationQueryDto,
  NotificationListResponseDto,
} from '../dto/notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register or refresh FCM device token',
    description:
      'Associates a Firebase Cloud Messaging registration token with the authenticated user and platform (ANDROID, IOS, WEB).',
  })
  @ApiResponse({
    status: 200,
    description: 'Device token registered successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
    type: ApiErrorResponseDto,
  })
  async registerToken(
    @CurrentUser() user: User,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    const deviceToken = await this.notificationService.registerDeviceToken(
      user.userId,
      dto,
    );
    return {
      message: 'Device token registered successfully',
      data: deviceToken,
    };
  }

  @Delete('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unregister FCM device token',
    description:
      'Removes the device token upon user logout so push notifications are no longer dispatched to this device.',
  })
  @ApiResponse({
    status: 200,
    description: 'Device token removed successfully',
  })
  async removeToken(
    @CurrentUser() user: User,
    @Body() dto: RemoveDeviceTokenDto,
  ) {
    return this.notificationService.removeDeviceToken(dto.token, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get notification inbox/history',
    description:
      'Fetches paginated notification records for the authenticated user, with optional filter by read status.',
  })
  @ApiWrappedResponse(
    NotificationListResponseDto,
    200,
    'Notifications retrieved successfully',
  )
  async getNotifications(
    @CurrentUser() user: User,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.getUserNotifications(user.userId, query);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Returns the total count of unread notifications for notification badge display.',
  })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationService.getUnreadCount(user.userId);
    return {
      unreadCount: count,
    };
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark a notification as read',
    description: 'Updates a specific notification status to read.',
  })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') notificationId: string,
  ) {
    const updated = await this.notificationService.markAsRead(
      user.userId,
      notificationId,
    );
    return {
      message: 'Notification marked as read',
      data: updated,
    };
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all unread notifications for the user as read.',
  })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationService.markAllAsRead(user.userId);
  }

  @Post('send-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test push notification dispatching',
    description:
      'Sends a test push notification to a specified userId, FCM token, or FCM topic. Useful for verifying setup before implementing business events.',
  })
  @ApiResponse({
    status: 200,
    description: 'Test notification triggered successfully',
  })
  async sendTestNotification(@Body() dto: SendTestNotificationDto) {
    const payload = {
      title: dto.title,
      body: dto.body,
      imageUrl: dto.imageUrl,
      data: dto.data,
    };

    if (dto.token) {
      const result = await this.notificationService.sendDirectToToken(
        dto.token,
        payload,
      );
      return {
        message: 'Test notification sent directly to token',
        result,
      };
    }

    if (dto.userId) {
      const result = await this.notificationService.sendToUser(
        dto.userId,
        payload,
        true,
      );
      return {
        message: `Test notification sent to user ${dto.userId}`,
        result,
      };
    }

    if (dto.topic) {
      const result = await this.notificationService.sendToTopic(
        dto.topic,
        payload,
      );
      return {
        message: `Test notification sent to topic ${dto.topic}`,
        result,
      };
    }

    return {
      message:
        'Please specify at least one target: "userId", "token", or "topic".',
      success: false,
    };
  }
}
