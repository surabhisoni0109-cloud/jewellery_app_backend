import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum StoreSortBy {
  DISTANCE = 'distance',
  RATING = 'rating',
  PRICE = 'price',
  NEWEST = 'newest',
}

export class StoreQueryDto {
  @ApiPropertyOptional({ example: 28.6139, description: 'User current latitude (optional - automatically uses user profile location if logged in)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 77.209, description: 'User current longitude (optional - automatically uses user profile location if logged in)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: 'New Delhi', description: 'Filter stores by city (optional - defaults to user profile city if logged in)' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Delhi', description: 'Filter stores by state' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '110005', description: 'Filter stores by pincode' })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: 'VND100001', description: 'Search stores by store UUID, vendor ID (e.g. VND100001), store name, area, city, or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: StoreSortBy, example: StoreSortBy.RATING, description: 'Sort criteria' })
  @IsEnum(StoreSortBy)
  @IsOptional()
  sortBy?: StoreSortBy;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}

export class StoreListItemDto {
  @ApiProperty({ example: 'uuid-xxxx' })
  id!: string;

  @ApiProperty({ example: 'VND100001' })
  userId!: string;

  @ApiProperty({ example: 'Soni Jewellers' })
  storeName!: string;

  @ApiProperty({ example: 'Handcrafted luxury jewellery', nullable: true })
  storeDescription!: string | null;

  @ApiProperty({ example: 'https://s3.amazonaws.com/.../logo.jpg', nullable: true })
  storeLogo!: string | null;

  @ApiProperty({ example: 'https://s3.amazonaws.com/.../cover-1.jpg', nullable: true })
  storeCoverImage!: string | null;

  @ApiProperty({
    example: { city: 'New Delhi', area: 'Karol Bagh', pincode: '110005', state: 'Delhi' },
  })
  location!: object | null;

  @ApiProperty({ example: 2.4, description: 'Distance in kilometers from user coordinates', nullable: true })
  distanceKm!: number | null;

  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 28 })
  totalReviews!: number;

  @ApiProperty({ example: 1500.0, nullable: true })
  jewelleryStartingPrice!: number | null;

  @ApiProperty({ example: true, description: 'Whether the store is currently open based on current time and operating hours' })
  isOpen!: boolean;

  @ApiProperty({ example: '10:00', nullable: true })
  storeOpeningTime!: string | null;

  @ApiProperty({ example: '20:30', nullable: true })
  storeClosingTime!: string | null;
}

export class RatingSummaryDto {
  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 120 })
  totalReviews!: number;

  @ApiProperty({
    example: { 1: 2, 2: 3, 3: 10, 4: 25, 5: 80 },
    description: 'Star rating distribution counts',
  })
  distribution!: Record<number, number>;
}

export class StoreDetailsDto {
  @ApiProperty({ example: 'uuid-xxxx' })
  id!: string;

  @ApiProperty({ example: 'VND100001' })
  userId!: string;

  @ApiProperty({ example: 'Soni Jewellers' })
  storeName!: string;

  @ApiProperty({ example: 'Handcrafted luxury jewellery since 1985', nullable: true })
  storeDescription!: string | null;

  @ApiProperty({ example: 'https://s3.amazonaws.com/.../logo.jpg', nullable: true })
  storeLogo!: string | null;

  @ApiProperty({ example: ['https://s3.../cover1.jpg', 'https://s3.../cover2.jpg'] })
  storeCoverImages!: string[];

  @ApiProperty({ example: { addressLine1: '123 Gold St', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110005' } })
  location!: object | null;

  @ApiProperty({ example: 2.4, nullable: true })
  distanceKm!: number | null;

  @ApiProperty({ example: 1500.0, nullable: true })
  jewelleryStartingPrice!: number | null;

  @ApiProperty({ example: 'https://soni-jewellers.com', nullable: true })
  storeWebsite!: string | null;

  @ApiProperty({ example: '9876543210', nullable: true })
  storeContactNumber!: string | null;

  @ApiProperty({ example: 'Rahul Sharma', nullable: true })
  storeOwnerName!: string | null;

  @ApiProperty({ example: '9876543210', nullable: true })
  whatsappNumber!: string | null;

  @ApiProperty({ example: 'contact@sonijewellers.com', nullable: true })
  storeEmail!: string | null;

  @ApiProperty({ example: '10:00', nullable: true })
  storeOpeningTime!: string | null;

  @ApiProperty({ example: '20:30', nullable: true })
  storeClosingTime!: string | null;

  @ApiProperty({ example: 1985, nullable: true })
  storeFoundedYear!: number | null;

  @ApiProperty({ example: true })
  isOpen!: boolean;

  @ApiProperty({ type: RatingSummaryDto })
  ratingSummary!: RatingSummaryDto;
}

export class StoreJewelleryQueryDto {
  @ApiPropertyOptional({ example: 'Ring', description: 'Filter by jewellery type (e.g. Ring, Necklace, Bangle)' })
  @IsString()
  @IsOptional()
  jewelleryType?: string;

  @ApiPropertyOptional({ example: 'FEMALE', description: 'Filter by target gender' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter items with active discount' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  hasDiscount?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter items marked for special occasion' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  hasSpecialOccasion?: boolean;

  @ApiPropertyOptional({ example: 'Gold', description: 'Search jewellery by title or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}

export class StoreJewelleryItemDto {
  @ApiProperty({ example: 'uuid-xxxx' })
  id!: string;

  @ApiProperty({ example: 'Kundan Diamond Necklace' })
  title!: string;

  @ApiProperty({ example: 'Handmade 22K kundan piece', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 45000.0 })
  price!: number;

  @ApiProperty({ example: 'https://s3.../jewellery-main.jpg' })
  imageUrl!: string;

  @ApiProperty({ example: ['https://s3.../img1.jpg', 'https://s3.../img2.jpg'] })
  images!: string[];

  @ApiProperty({ example: 'Necklace', nullable: true })
  jewelleryType!: string | null;

  @ApiProperty({ example: '35g', nullable: true })
  weight!: string | null;

  @ApiProperty({ example: '22K', nullable: true })
  purity!: string | null;

  @ApiProperty({ example: 'FEMALE', nullable: true })
  gender!: string | null;

  @ApiProperty({ example: true })
  hasDiscount!: boolean;

  @ApiProperty({ example: 10.0, nullable: true })
  discountPercentage!: number | null;

  @ApiProperty({ example: 40500.0, nullable: true })
  discountPrice!: number | null;

  @ApiProperty({ example: true })
  hasSpecialOccasion!: boolean;

  @ApiProperty({ example: 'Diwali', nullable: true })
  specialOccasionName!: string | null;

  @ApiProperty({ example: '2026-11-01', nullable: true })
  specialOccasionDate!: string | null;
}

export class StoreRatingsQueryDto {
  @ApiPropertyOptional({ example: 5, description: 'Filter reviews by specific star rating (1 to 5)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;
}

export class StoreReviewItemDto {
  @ApiProperty({ example: 'uuid-xxxx' })
  id!: string;

  @ApiProperty({ example: 'USR100001', nullable: true })
  customerId!: string | null;

  @ApiProperty({ example: 'Priya Verma' })
  customerName!: string;

  @ApiProperty({ example: 'https://s3.../profile.jpg', nullable: true })
  customerProfileImage!: string | null;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiProperty({ example: 'Excellent craftsmanship and trusted quality!', nullable: true })
  review!: string | null;

  @ApiProperty({ example: '2026-10-10T14:30:00.000Z' })
  createdAt!: string;
}

export class CreateStoreRatingDto {
  @ApiProperty({ example: 5, description: 'Star rating from 1 to 5', minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt({ message: 'rating must be an integer between 1 and 5' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating cannot exceed 5' })
  @IsNotEmpty({ message: 'rating is required' })
  rating!: number;

  @ApiPropertyOptional({ example: 'Beautiful collection and great service!', description: 'Review comment (optional)' })
  @IsString()
  @IsOptional()
  review?: string;
}

export class CreateStoreEnquiryDto {
  @ApiProperty({ example: 'Hello, I want to know if this necklace is available in 18K white gold?', description: 'Enquiry message' })
  @IsString()
  @IsNotEmpty({ message: 'message is required' })
  message!: string;

  @ApiPropertyOptional({ example: 'uuid-jewellery-id', description: 'Optional ID of specific jewellery item being enquired about' })
  @IsString()
  @IsOptional()
  jewelleryId?: string;
}
