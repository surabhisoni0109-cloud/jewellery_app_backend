import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsIndianMobile } from '../common/validators/indian-mobile.validator';

export class SignupVerifyDto {
  @ApiProperty({
    example: '9876543210',
    description: '10-digit Indian mobile number registered during signup',
    required: true,
  })
  @IsIndianMobile()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  mobileNumber!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code received via SMS',
    required: true,
  })
  @IsString()
  @Length(6, 6, { message: 'otp must be exactly 6 numeric digits' })
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  otp!: string;
}
