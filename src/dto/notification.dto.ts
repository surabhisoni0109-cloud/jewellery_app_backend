import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum DevicePlatformEnum {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export class RegisterDeviceTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging (FCM) registration token',
    example: 'f8dJk7_example_fcm_token_xyz123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Token cannot be empty' })
  token!: string;

  @ApiPropertyOptional({
    description: 'Device operating system platform',
    enum: DevicePlatformEnum,
    default: DevicePlatformEnum.ANDROID,
    example: DevicePlatformEnum.ANDROID,
  })
  @IsEnum(DevicePlatformEnum, {
    message: 'Platform must be ANDROID, IOS, or WEB',
  })
  @IsOptional()
  platform: DevicePlatformEnum = DevicePlatformEnum.ANDROID;

  @ApiPropertyOptional({
    description: 'Unique client device UUID or hardware identifier',
    example: 'c2b4d45e-881b-4f4d-b3b3-8c4d29f8f2b1',
  })
  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class RemoveDeviceTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging (FCM) token to unregister',
    example: 'f8dJk7_example_fcm_token_xyz123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Token cannot be empty' })
  token!: string;
}

export class SendTestNotificationDto {
  @ApiPropertyOptional({
    description: 'Target User ID (e.g. USR100001). Sends to all active devices registered to this user.',
    example: 'USR100001',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Target specific FCM registration token directly',
    example: 'f8dJk7_example_fcm_token_xyz123',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    description: 'Target FCM topic (e.g. "promotions", "all_vendors")',
    example: 'all_users',
  })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Special Offer Just For You!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @ApiProperty({
    description: 'Notification body text',
    example: 'Get 20% off on your first handcrafted jewellery enquiry today.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Body is required' })
  body!: string;

  @ApiPropertyOptional({
    description: 'Optional image URL to display with rich push notification',
    example: 'https://example.com/images/banner.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Custom key-value string payload for in-app navigation or action handling',
    example: { screen: 'EnquiryDetails', enquiryId: 'ENQ12345' },
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, string>;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Number of notifications per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by read status: true for read, false for unread',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isRead?: boolean;
}

export class NotificationItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'USR100001' })
  userId!: string;

  @ApiProperty({ example: 'New Enquiry Received' })
  title!: string;

  @ApiProperty({ example: 'John Doe is inquiring about Diamond Ring.' })
  body!: string;

  @ApiPropertyOptional({ example: { screen: 'EnquiryDetails', enquiryId: 'ENQ123' } })
  data?: any;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  imageUrl?: string | null;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiPropertyOptional({ example: '2026-10-03T10:00:00.000Z' })
  readAt?: Date | null;

  @ApiProperty({ example: '2026-10-03T09:45:00.000Z' })
  createdAt!: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationItemDto] })
  notifications!: NotificationItemDto[];

  @ApiProperty({ example: 45 })
  total!: number;

  @ApiProperty({ example: 3 })
  unreadCount!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
