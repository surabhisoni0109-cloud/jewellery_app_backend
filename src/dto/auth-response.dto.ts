import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OnboardingStep, UserStatus, UserType } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Internal UUID' })
  id!: string;

  @ApiProperty({ example: 'USR123456', description: 'Public identifier (USR123456 or VND123456)' })
  userId!: string;

  @ApiProperty({ enum: UserType, example: 'USER' })
  type!: UserType;

  @ApiProperty({ example: 'Yogesh' })
  firstName!: string;

  @ApiProperty({ example: 'Kumawat' })
  lastName!: string;

  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;

  @ApiProperty({ example: 'yogesh@example.com' })
  email!: string;

  @ApiProperty({ enum: UserStatus, example: 'ACTIVE' })
  status!: UserStatus;

  @ApiProperty({ example: true })
  isMobileVerified!: boolean;

  @ApiProperty({ example: '2026-09-20T15:45:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-20T15:45:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({
    example: false,
    description: 'Whether onboarding is completed (always true for regular buyers, progress tracked for vendors)',
  })
  isOnboarded!: boolean;

  @ApiProperty({
    enum: OnboardingStep,
    example: 'PENDING',
    description: 'Current onboarding progress step (PENDING, STEP_1_DONE, STEP_2_DONE, COMPLETED)',
  })
  onboardingStep!: OnboardingStep;
}

export class OtpResponseDto {
  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;

  @ApiPropertyOptional({ example: '2026-09-20T15:50:00.000Z', description: 'Expiration ISO timestamp' })
  expiresAt?: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'development only, present only when EXPOSE_OTP_IN_RESPONSE=true',
  })
  devOtp?: string;
}

export class AuthSessionResponseDto {
  @ApiProperty({ example: 'USR123456' })
  userId!: string;

  @ApiProperty({ example: 'user' })
  type!: string;

  @ApiProperty({ example: 'Yogesh' })
  firstName!: string;

  @ApiProperty({ example: 'Kumawat' })
  lastName!: string;

  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;

  @ApiProperty({ example: 'yogesh@example.com' })
  email!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer Access Token',
  })
  token!: string;

  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer Refresh Token',
  })
  refreshToken?: string;

  @ApiProperty({
    example: false,
    description: 'Whether onboarding is completed (always true for regular buyers, progress tracked for vendors)',
  })
  isOnboarded!: boolean;

  @ApiProperty({
    enum: OnboardingStep,
    example: 'PENDING',
    description: 'Current onboarding progress step (PENDING, STEP_1_DONE, STEP_2_DONE, COMPLETED)',
  })
  onboardingStep!: OnboardingStep;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Fresh JWT Bearer Access Token',
  })
  token!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Rotated JWT Bearer Refresh Token',
  })
  refreshToken!: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Token type',
  })
  tokenType!: string;

  @ApiProperty({
    example: 900,
    description: 'Access token expiration in seconds',
  })
  expiresIn!: number;
}

