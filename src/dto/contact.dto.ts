import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InquiryStatusEnum {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
}

export class UpdateCompanyContactDto {
  @ApiPropertyOptional({
    description: 'Official support contact email address',
    example: 'support@jewelleryapp.com',
  })
  @IsEmail({}, { message: 'Please provide a valid support email' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Customer helpline phone number',
    example: '+91 98765 43210',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Official WhatsApp customer service number',
    example: '+91 98765 43210',
  })
  @IsString()
  @IsOptional()
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'Physical store/office address',
    example: '123 Jewellery Lane, Zaveri Bazaar, Mumbai, Maharashtra 400002',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Support operational hours',
    example: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
  })
  @IsString()
  @IsOptional()
  supportHours?: string;
}

export class CreateContactInquiryDto {
  @ApiProperty({
    description: 'Name of customer submitting the inquiry',
    example: 'Aarav Patel',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'aarav.patel@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiPropertyOptional({
    description: 'Customer mobile/phone number',
    example: '9876543210',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Subject of the inquiry',
    example: 'Question regarding custom jewellery order',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    description: 'Inquiry message details',
    example: 'Hello, I would like to inquire about customizing an 18K gold ring.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message!: string;
}

export class UpdateInquiryStatusDto {
  @ApiProperty({
    enum: InquiryStatusEnum,
    example: InquiryStatusEnum.RESOLVED,
  })
  @IsEnum(InquiryStatusEnum)
  @IsNotEmpty()
  status!: InquiryStatusEnum;

  @ApiPropertyOptional({
    description: 'Internal admin resolution note',
    example: 'Called customer on 3rd Oct and answered ring customization details.',
  })
  @IsString()
  @IsOptional()
  adminNote?: string;
}

export class InquiryQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    enum: InquiryStatusEnum,
    description: 'Filter inquiries by status',
  })
  @IsOptional()
  @IsEnum(InquiryStatusEnum)
  status?: InquiryStatusEnum;

  @ApiPropertyOptional({
    description: 'Search inquiries by customer name, email, or subject',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
