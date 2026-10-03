import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateJewelleryDto {
  @ApiProperty({
    description: 'Jewellery Name',
    example: '22K Royal Gold Kundan Necklace',
  })
  @IsString()
  @IsNotEmpty({ message: 'Jewellery name is required' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Jewellery Description',
    example: 'Handcrafted heritage royal Kundan necklace with authentic hallmark certification.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Jewellery Price in INR',
    example: 85000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price cannot be negative' })
  price!: number;

  @ApiPropertyOptional({
    description: 'Jewellery Type (e.g., Gold, Silver, Platinum, Diamond, Gemstone)',
    example: 'Gold',
  })
  @IsString()
  @IsOptional()
  jewelleryType?: string;

  @ApiPropertyOptional({
    description: 'Jewellery Weight (e.g., 10gram, 1.5gram)',
    example: '15.5 gram',
  })
  @IsString()
  @IsOptional()
  weight?: string;

  @ApiPropertyOptional({
    description: 'Jewellery Purity (e.g., 24K, 22K, 18K, 925)',
    example: '22K',
  })
  @IsString()
  @IsOptional()
  purity?: string;

  @ApiPropertyOptional({
    description: 'Jewellery For (e.g., Men, Women, Unisex)',
    example: 'Women',
  })
  @IsString()
  @IsOptional()
  jewelleryFor?: string;

  @ApiPropertyOptional({
    description: 'Special occasion checkbox toggle (enables special occasion name & date)',
    default: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  hasSpecialOccasion?: boolean = false;

  @ApiPropertyOptional({
    description: 'Special Occasion Name (e.g., Wedding, Diwali, Dhanteras, Anniversary)',
    example: 'Wedding',
  })
  @IsString()
  @IsOptional()
  specialOccasionName?: string;

  @ApiPropertyOptional({
    description: 'Special Occasion Date',
    example: '2026-11-12T00:00:00.000Z',
  })
  @IsOptional()
  specialOccasionDate?: string | Date;

  @ApiPropertyOptional({
    description: 'Discount checkbox toggle',
    default: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  hasDiscount?: boolean = false;

  @ApiPropertyOptional({
    description: 'Discount percentage (e.g. 10 for 10% off)',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({
    description: 'Final discounted price (calculated automatically if not provided)',
    example: 76500,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({
    description: 'Publish status (true = active in marketplace, false = draft)',
    default: true,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isPublished?: boolean = true;

  @ApiPropertyOptional({
    description: 'Select multiple jewellery images from your device (up to 5 images, max 5MB each)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  images?: any;
}

export class UpdateJewelleryDto {
  @ApiPropertyOptional({ example: '22K Royal Gold Kundan Necklace' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 85000 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'Gold' })
  @IsString()
  @IsOptional()
  jewelleryType?: string;

  @ApiPropertyOptional({ example: '15.5 gram' })
  @IsString()
  @IsOptional()
  weight?: string;

  @ApiPropertyOptional({ example: '22K' })
  @IsString()
  @IsOptional()
  purity?: string;

  @ApiPropertyOptional({ example: 'Women' })
  @IsString()
  @IsOptional()
  jewelleryFor?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  hasSpecialOccasion?: boolean;

  @ApiPropertyOptional({ example: 'Wedding' })
  @IsString()
  @IsOptional()
  specialOccasionName?: string;

  @ApiPropertyOptional({ example: '2026-11-12T00:00:00.000Z' })
  @IsOptional()
  specialOccasionDate?: string | Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  hasDiscount?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 76500 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Upload new jewellery images from your device (select multiple files, up to 5)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsOptional()
  images?: any;

  @ApiPropertyOptional({
    description: 'Existing image URLs to retain when updating (optional, array of URLs or JSON string)',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.filter((v) => typeof v === 'string' && v.trim() !== '');
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter((v) => typeof v === 'string' && v.trim() !== '');
          }
        } catch {
          // ignore error and continue
        }
      }
      if (trimmed.includes(',')) {
        return trimmed
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
      return [trimmed];
    }
    return undefined;
  })
  @IsArray({ message: 'existingImages must be an array of URL strings' })
  @IsString({ each: true })
  existingImages?: string[];
}

export class JewelleryQueryDto {
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

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by jewellery type (e.g. Gold, Silver)' })
  @IsOptional()
  @IsString()
  jewelleryType?: string;

  @ApiPropertyOptional({ description: 'Filter by jewellery for (e.g. Men, Women, Unisex)' })
  @IsOptional()
  @IsString()
  jewelleryFor?: string;

  @ApiPropertyOptional({ description: 'Filter by publish status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Filter only items with active discount' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  hasDiscount?: boolean;

  @ApiPropertyOptional({ description: 'Filter only items with special occasion' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  hasSpecialOccasion?: boolean;
}

export class JewelleryResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: '22K Royal Gold Kundan Necklace' })
  name!: string;

  @ApiPropertyOptional({ example: 'Handcrafted necklace' })
  description?: string | null;

  @ApiProperty({ example: 85000 })
  price!: number;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/image1.jpg' })
  imageUrl!: string;

  @ApiProperty({ example: ['https://bucket.s3.amazonaws.com/image1.jpg'] })
  images!: string[];

  @ApiPropertyOptional({ example: 'Gold' })
  jewelleryType?: string | null;

  @ApiPropertyOptional({ example: '15.5 gram' })
  weight?: string | null;

  @ApiPropertyOptional({ example: '22K' })
  purity?: string | null;

  @ApiPropertyOptional({ example: 'Women' })
  jewelleryFor?: string | null;

  @ApiProperty({ example: true })
  hasSpecialOccasion!: boolean;

  @ApiPropertyOptional({ example: 'Wedding' })
  specialOccasionName?: string | null;

  @ApiPropertyOptional({ example: '2026-11-12T00:00:00.000Z' })
  specialOccasionDate?: Date | null;

  @ApiProperty({ example: true })
  hasDiscount!: boolean;

  @ApiPropertyOptional({ example: 10 })
  discountPercentage?: number | null;

  @ApiPropertyOptional({ example: 76500 })
  discountPrice?: number | null;

  @ApiProperty({ example: true })
  isPublished!: boolean;

  @ApiProperty({ example: '2026-10-03T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-03T10:00:00.000Z' })
  updatedAt!: Date;
}
