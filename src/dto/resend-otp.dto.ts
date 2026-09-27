import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { IsIndianMobile } from '../common/validators/indian-mobile.validator';

export enum OtpPurpose {
  SIGNUP = 'signup',
  SIGNIN = 'signin',
}

export class ResendOtpDto {
  @ApiProperty({
    enum: UserType,
    example: 'user',
    description: 'Account type role (user or vendor)',
    required: true,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  @IsEnum(UserType, { message: 'type must be one of the following values: user, vendor' })
  @IsNotEmpty()
  type!: UserType;

  @ApiProperty({
    example: '9876543210',
    description: '10-digit Indian mobile number',
    required: true,
  })
  @IsIndianMobile()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mobileNumber!: string;

  @ApiPropertyOptional({
    enum: OtpPurpose,
    example: 'signup',
    description: "Purpose of OTP: 'signup' or 'signin'. Defaults to 'signin' if omitted.",
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  @IsEnum(OtpPurpose, { message: "purpose must be either 'signup' or 'signin'" })
  purpose?: OtpPurpose = OtpPurpose.SIGNIN;
}
