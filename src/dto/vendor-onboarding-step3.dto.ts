import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShowcaseItemDto {
  @ApiProperty({ example: 'Kundan Necklace', description: 'Jewellery item title (max 100 chars)', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  @ApiProperty({ example: 'Hand-crafted Kundan necklace with gold plating', description: 'Item description (max 500 chars)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @ApiProperty({ example: 25000.00, description: 'Item price in INR (positive number)', required: true })
  @IsNumber({}, { message: 'price must be a number' })
  @IsPositive({ message: 'price must be a positive number' })
  @Transform(({ value }) => parseFloat(value))
  price!: number;

  // image file is handled by Multer; this field is used only for Swagger doc
  @ApiProperty({ type: 'string', format: 'binary', description: 'Jewellery item image (jpg, jpeg, png, webp — max 5MB)', required: true })
  @IsOptional()
  image?: string;
}

export class VendorOnboardingStep3Dto {
  @ApiProperty({
    type: [ShowcaseItemDto],
    description: 'Array of up to 5 jewellery showcase items',
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one jewellery item must be provided' })
  @ArrayMaxSize(5, { message: 'Maximum 5 jewellery items can be submitted at a time' })
  @ValidateNested({ each: true })
  @Type(() => ShowcaseItemDto)
  items!: ShowcaseItemDto[];
}
