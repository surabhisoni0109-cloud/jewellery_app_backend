import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsIndianMobile } from '../common/validators/indian-mobile.validator';

export class SignupDto {
  @ApiProperty({
    enum: UserType,
    example: 'user',
    description: 'Account type role (user or vendor)',
    required: true,
  })
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
  @IsEnum(UserType, { message: 'type must be one of the following values: user, vendor' })
  @IsNotEmpty()
  type!: UserType;

  @ApiProperty({
    example: 'Yogesh',
    description: 'First name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  firstName!: string;

  @ApiProperty({
    example: 'Kumawat',
    description: 'Last name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  lastName!: string;

  @ApiProperty({
    example: '9876543210',
    description: '10-digit Indian mobile number',
    required: true,
  })
  @IsIndianMobile({ message: 'mobileNumber must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9' })
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  mobileNumber!: string;

  @ApiProperty({
    example: 'yogesh@example.com',
    description: 'Email address of the user',
    required: true,
  })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email!: string;
}
