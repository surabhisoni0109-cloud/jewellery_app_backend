import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@jewellery.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AdminUpdateProfileDto {
  @ApiPropertyOptional({ example: 'Super Admin' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'admin@jewellery.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}

export class AdminChangePasswordDto {
  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewAdmin@456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword!: string;
}

import { Transform } from 'class-transformer';

export class AdminBroadcastNotificationDto {
  @ApiProperty({ example: 'Special Festive Discount!' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @ApiProperty({ example: 'Get flat 20% off on jewellery making charges this weekend.' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  body!: string;

  @ApiProperty({
    example: ['USER', 'VENDOR'],
    description: 'Target audience: USER, VENDOR, or both',
    isArray: true,
  })
  @IsNotEmpty({ message: 'Target audience is required' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return value.split(',').map((v: string) => v.trim()).filter(Boolean);
    }
    return value;
  })
  targets!: ('USER' | 'VENDOR')[];

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
