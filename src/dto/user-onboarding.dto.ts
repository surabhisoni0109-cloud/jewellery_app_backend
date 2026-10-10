import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsMinAge } from '../common/validators/min-age.validator';

export class UserLocationDto {
  @ApiProperty({ example: 28.6139, description: 'Latitude (optional)', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 77.209, description: 'Longitude (optional)', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: '123, Gold Street', description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @ApiProperty({ example: 'Near ABC Mall', description: 'Address line 2 (optional)', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Karol Bagh', description: 'Area / locality' })
  @IsString()
  @IsNotEmpty()
  area!: string;

  @ApiProperty({ example: 'New Delhi', description: 'City' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Delhi', description: 'State' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: 'India', description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({ example: '110005', description: 'Pincode / postal code' })
  @IsString()
  @IsNotEmpty()
  pincode!: string;
}

export class UserOnboardingDto {
  @ApiProperty({
    example: 'Yogesh',
    description: 'First name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'firstName cannot be empty' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiProperty({
    example: 'Kumawat',
    description: 'Last name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'lastName cannot be empty' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiProperty({
    example: 'yogesh@example.com',
    description: 'Email address of the user',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email?: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Mobile number of the user (read-only, cannot be updated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  mobileNumber?: string;

  @ApiProperty({
    enum: Gender,
    example: 'MALE',
    description: 'User gender',
    required: true,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  @IsEnum(Gender, { message: 'gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY' })
  @IsNotEmpty()
  gender!: Gender;

  @ApiProperty({
    example: '1995-06-15',
    description: 'Date of birth in YYYY-MM-DD format. User must be at least 18 years old.',
    required: true,
  })
  @IsDateString({}, { message: 'dob must be a valid ISO date string (YYYY-MM-DD)' })
  @IsMinAge(18, { message: 'User must be at least 18 years old' })
  @IsNotEmpty()
  dob!: string;

  @ApiProperty({
    description: 'User location as a JSON object or string',
    example: {
      latitude: 28.6139,
      longitude: 77.209,
      addressLine1: '123 Gold St',
      area: 'Karol Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110005',
    },
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserLocationDto)
  location!: UserLocationDto;

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

export class UserOnboardingResponseDto {
  @ApiProperty({ example: true })
  isOnboarded!: boolean;

  @ApiProperty({ example: 'Yogesh', nullable: true })
  firstName?: string;

  @ApiProperty({ example: 'Kumawat', nullable: true })
  lastName?: string;

  @ApiProperty({ example: 'yogesh@example.com', nullable: true })
  email?: string;

  @ApiProperty({ example: '9876543210', nullable: true })
  mobileNumber?: string;

  @ApiProperty({ example: 'MALE', enum: Gender, nullable: true })
  gender!: Gender | null;

  @ApiProperty({ example: '1995-06-15', nullable: true })
  dob!: string | null;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/users/USR100001/profile.jpg',
    nullable: true,
  })
  profilePicture!: string | null;

  @ApiProperty({
    example: {
      latitude: 28.6139,
      longitude: 77.209,
      addressLine1: '123 Gold St',
      area: 'Karol Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110005',
    },
    nullable: true,
  })
  location!: object | null;
}
