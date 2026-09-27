import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum DashboardPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class DashboardGraphQueryDto {
  @ApiPropertyOptional({
    enum: DashboardPeriod,
    default: DashboardPeriod.WEEK,
    description: 'Time period for chart: day (hourly), week (daily), month (daily), or year (monthly)',
  })
  @IsOptional()
  @IsEnum(DashboardPeriod, { message: "period must be one of: 'day', 'week', 'month', 'year'" })
  period: DashboardPeriod = DashboardPeriod.WEEK;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page number for pagination (starts at 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be greater than or equal to 1' })
  page: number = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of records per page (max 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be greater than or equal to 1' })
  @Max(100, { message: 'limit cannot exceed 100' })
  limit: number = 10;
}

export class DashboardAnalyticsResponseDto {
  @ApiProperty({ example: 1420, description: "Total number of users who have viewed the vendor's store" })
  totalStoreViews!: number;

  @ApiProperty({ example: 85, description: 'Total number of customer enquiries received by the vendor' })
  totalEnquiries!: number;

  @ApiProperty({ example: 42, description: 'Total number of ratings/reviews received by the vendor' })
  totalRatings!: number;

  @ApiProperty({ example: 15, description: 'Total number of jewellery products listed in showcase by the vendor' })
  totalProductsListed!: number;
}

export class GraphDataPointDto {
  @ApiProperty({ example: 'Mon', description: 'Label for graph axis (e.g. hour, weekday, day, or month)' })
  label!: string;

  @ApiPropertyOptional({ example: '2026-09-21', description: 'Date in YYYY-MM-DD format if applicable' })
  date?: string;

  @ApiProperty({ example: 14, description: 'Event count for this time bucket' })
  count!: number;
}

export class DashboardGraphResponseDto {
  @ApiProperty({ enum: DashboardPeriod, example: 'week' })
  period!: DashboardPeriod;

  @ApiProperty({ example: 128, description: 'Total count across the selected period' })
  total!: number;

  @ApiProperty({ type: [GraphDataPointDto], description: 'Ordered time series graph data points with pre-filled zero coordinates' })
  points!: GraphDataPointDto[];
}

export class CustomerSummaryDto {
  @ApiProperty({ example: 'Pooja Verma' })
  name!: string;

  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/bucket/profile.jpg', nullable: true })
  profileImage!: string | null;
}

export class ProductSummaryDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'Kundan Choker Necklace' })
  title!: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/necklace.jpg' })
  imageUrl!: string;

  @ApiProperty({ example: '45000.00' })
  price!: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 85 })
  totalRecords!: number;

  @ApiProperty({ example: 9 })
  totalPages!: number;
}

export class EnquiryListItemDto {
  @ApiProperty({ example: 'ENQ100001', description: 'Unique public enquiry identifier' })
  enquiryId!: string;

  @ApiProperty({ example: 'Is this necklace available in 22K gold?' })
  message!: string;

  @ApiProperty({ type: CustomerSummaryDto })
  customer!: CustomerSummaryDto;

  @ApiPropertyOptional({ type: ProductSummaryDto, nullable: true })
  product!: ProductSummaryDto | null;

  @ApiProperty({ example: '2026-09-27', description: 'Date of enquiry (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ example: '14:30:00', description: 'Time of enquiry (HH:mm:ss)' })
  time!: string;

  @ApiProperty({ example: '2026-09-27T14:30:00.000Z', description: 'Full ISO timestamp' })
  createdAt!: Date;
}

export class EnquiriesListResponseDto {
  @ApiProperty({ type: [EnquiryListItemDto] })
  enquiries!: EnquiryListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

export class RatingListItemDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5, description: 'Star rating from 1 to 5' })
  rating!: number;

  @ApiPropertyOptional({ example: 'Beautiful craftsmanship and fast delivery!', nullable: true })
  review!: string | null;

  @ApiProperty({ example: 'Yogesh Soni' })
  customerName!: string;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/bucket/profile.jpg', nullable: true })
  customerProfileImage!: string | null;

  @ApiProperty({ example: '2026-09-27', description: 'Date of rating (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ example: '14:30:00', description: 'Time of rating (HH:mm:ss)' })
  time!: string;

  @ApiProperty({ example: '2026-09-27T14:30:00.000Z', description: 'Full ISO timestamp' })
  createdAt!: Date;
}

export class RatingsListResponseDto {
  @ApiProperty({ type: [RatingListItemDto] })
  ratings!: RatingListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

export class RatingStarDistributionDto {
  @ApiProperty({ example: 28, description: 'Number of ratings with this star count' })
  count!: number;

  @ApiProperty({ example: 66.7, description: 'Percentage of total ratings' })
  percentage!: number;
}

export class RatingSummaryResponseDto {
  @ApiProperty({ example: 42, description: 'Total number of ratings' })
  totalRatings!: number;

  @ApiProperty({ example: 4.6, description: 'Average rating rounded to 1 decimal place' })
  averageRating!: number;

  @ApiProperty({
    description: 'Rating breakdown distribution for 1, 2, 3, 4, and 5 stars',
    example: {
      '5': { count: 28, percentage: 66.7 },
      '4': { count: 10, percentage: 23.8 },
      '3': { count: 3, percentage: 7.1 },
      '2': { count: 1, percentage: 2.4 },
      '1': { count: 0, percentage: 0 },
    },
  })
  distribution!: {
    '1': RatingStarDistributionDto;
    '2': RatingStarDistributionDto;
    '3': RatingStarDistributionDto;
    '4': RatingStarDistributionDto;
    '5': RatingStarDistributionDto;
  };
}
