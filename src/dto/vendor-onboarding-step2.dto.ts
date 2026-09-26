import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsIndianMobile } from '../common/validators/indian-mobile.validator';
import { IsTimeFormat } from '../common/validators/time-format.validator';

export class StoreLocationDto {
  @ApiProperty({ example: 28.6139, description: 'Latitude (optional)', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 77.209, description: 'Longitude (optional)', required: false })
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

export class VendorOnboardingStep2Dto {
  @ApiProperty({ example: 'Soni Jewellers', description: 'Store name (max 100 chars)', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  storeName!: string;

  @ApiProperty({ example: 'Premium handcrafted jewellery since 1985', description: 'Store description (max 1000 chars)', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  storeDescription!: string;

  @ApiProperty({
    description: 'Store location as a JSON string (latitude and longitude are optional)',
    example: '{"latitude":28.6139,"longitude":77.209,"addressLine1":"123 Gold St","area":"Karol Bagh","city":"New Delhi","state":"Delhi","country":"India","pincode":"110005"}',
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => StoreLocationDto)
  storeLocation!: StoreLocationDto;

  @ApiProperty({ example: 1500.00, description: 'Jewellery starting price in INR (positive number)', required: true })
  @IsNumber({}, { message: 'jewelleryStartingPrice must be a number' })
  @IsPositive({ message: 'jewelleryStartingPrice must be a positive number' })
  @Transform(({ value }) => parseFloat(value))
  jewelleryStartingPrice!: number;

  @ApiProperty({ example: 'https://soni-jewellers.com', description: 'Store website URL (optional)', required: false })
  @IsUrl({}, { message: 'storeWebsite must be a valid URL' })
  @IsOptional()
  storeWebsite?: string;

  @ApiProperty({ example: '9876543210', description: '10-digit Indian contact number for the store', required: true })
  @IsIndianMobile({ message: 'storeContactNumber must be a valid 10-digit Indian mobile number' })
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  storeContactNumber!: string;

  @ApiProperty({ example: 'contact@sonijewellers.com', description: 'Store email address', required: true })
  @IsEmail({}, { message: 'storeEmail must be a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  storeEmail!: string;

  @ApiProperty({ example: '09:00', description: 'Store opening time in HH:MM (24-hr) format', required: true })
  @IsTimeFormat({ message: 'storeOpeningTime must be in HH:MM (24-hour) format' })
  @IsNotEmpty()
  storeOpeningTime!: string;

  @ApiProperty({ example: '21:00', description: 'Store closing time in HH:MM (24-hr) format — must be after opening time', required: true })
  @IsTimeFormat({ message: 'storeClosingTime must be in HH:MM (24-hour) format' })
  @IsNotEmpty()
  storeClosingTime!: string;

  @ApiProperty({ example: 1985, description: 'Year the store was founded (between 1800 and current year)', required: true })
  @IsInt({ message: 'storeFoundedYear must be an integer year' })
  @Min(1800, { message: 'storeFoundedYear must be 1800 or later' })
  @Max(new Date().getFullYear(), { message: `storeFoundedYear cannot be in the future` })
  @Transform(({ value }) => parseInt(value, 10))
  storeFoundedYear!: number;

  // storeLogo and storeCoverImages are handled as Multer files
  @ApiProperty({ type: 'string', format: 'binary', description: 'Store logo image (jpg, jpeg, png, webp — max 5MB)', required: false })
  @IsOptional()
  storeLogo?: string;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Up to 5 store cover images', required: false })
  @IsOptional()
  storeCoverImages?: string[];
}
