import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsMinAge } from '../common/validators/min-age.validator';

export class VendorOnboardingStep1Dto {
  @ApiProperty({
    example: 'Yogesh',
    description: 'First name of the vendor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'firstName cannot be empty' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiProperty({
    example: 'Kumawat',
    description: 'Last name of the vendor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'lastName cannot be empty' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiProperty({
    example: 'yogesh@example.com',
    description: 'Email address of the vendor',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email?: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Mobile number of the vendor (read-only, cannot be updated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mobileNumber?: string;

  @ApiProperty({
    enum: Gender,
    example: 'MALE',
    description: 'Vendor gender',
    required: true,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  @IsEnum(Gender, { message: 'gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' })
  @IsNotEmpty()
  gender!: Gender;

  @ApiProperty({
    example: '1995-06-15',
    description: 'Date of birth in YYYY-MM-DD format. Vendor must be at least 18 years old.',
    required: true,
  })
  @IsDateString({}, { message: 'dob must be a valid ISO date string (YYYY-MM-DD)' })
  @IsMinAge(18, { message: 'Vendor must be at least 18 years old' })
  @IsNotEmpty()
  dob!: string;

  // profilePicture is handled as Multer file, not as DTO field
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile picture (jpg, jpeg, png, webp — max 5MB)',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}
