import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { IsIndianMobile } from '../common/validators/indian-mobile.validator';

export class SigninDto {
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
    example: '9876543210',
    description: '10-digit Indian mobile number',
    required: true,
  })
  @IsIndianMobile()
  @IsNotEmpty()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  mobileNumber!: string;
}
