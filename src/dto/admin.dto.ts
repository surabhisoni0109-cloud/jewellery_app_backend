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
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
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
  currentPassword: string;

  @ApiProperty({ example: 'NewAdmin@456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;
}
