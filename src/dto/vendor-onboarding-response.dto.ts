import { ApiProperty } from '@nestjs/swagger';
import { OnboardingStep, Gender } from '@prisma/client';

// ── Step 1 Response ────────────────────────────────────────────────────────

export class Step1ResponseDto {
  @ApiProperty({ example: 'STEP_1_DONE', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: 'Rahul', nullable: true })
  firstName?: string;

  @ApiProperty({ example: 'Sharma', nullable: true })
  lastName?: string;

  @ApiProperty({ example: 'rahul@gmail.com', nullable: true })
  email?: string;

  @ApiProperty({ example: '9876543210', nullable: true })
  mobileNumber?: string;

  @ApiProperty({ example: 'MALE', enum: Gender, nullable: true })
  gender!: Gender | null;

  @ApiProperty({ example: '1995-06-15', nullable: true })
  dob!: string | null;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/vendors/VND100001/profile.jpg', nullable: true })
  profilePicture!: string | null;
}

// ── Step 2 Response ────────────────────────────────────────────────────────

export class Step2ResponseDto {
  @ApiProperty({ example: 'COMPLETED', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: true })
  isOnboarded!: boolean;

  @ApiProperty({ example: 'Soni Jewellers' })
  storeName!: string;

  @ApiProperty({ example: 'Premium handcrafted jewellery since 1985', nullable: true })
  storeDescription!: string | null;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/vendors/VND100001/logo.jpg', nullable: true })
  storeLogo!: string | null;

  @ApiProperty({ type: [String], example: ['https://s3.amazonaws.com/...'] })
  storeCoverImages!: string[];

  @ApiProperty({ example: { addressLine1: '123 Gold St', area: 'Karol Bagh', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110005' } })
  storeLocation!: object;

  @ApiProperty({ example: 1500.00, nullable: true })
  jewelleryStartingPrice!: number | null;

  @ApiProperty({ example: 'https://soni-jewellers.com', nullable: true })
  storeWebsite!: string | null;

  @ApiProperty({ example: '9876543210', nullable: true })
  storeContactNumber!: string | null;

  @ApiProperty({ example: 'Rahul Sharma', nullable: true })
  storeOwnerName!: string | null;

  @ApiProperty({ example: '9876543210', nullable: true })
  whatsappNumber!: string | null;

  @ApiProperty({ example: 'store@sonijewellers.com', nullable: true })
  storeEmail!: string | null;

  @ApiProperty({ example: '10:00 AM', nullable: true })
  storeOpeningTime!: string | null;

  @ApiProperty({ example: '08:30 PM', nullable: true })
  storeClosingTime!: string | null;

  @ApiProperty({ example: 1985, nullable: true })
  storeFoundedYear!: number | null;
}

// ── Showcase Item Response ─────────────────────────────────────────────────

export class ShowcaseItemResponseDto {
  @ApiProperty({ example: 'uuid-xxxx' })
  id!: string;

  @ApiProperty({ example: 'Kundan Necklace' })
  title!: string;

  @ApiProperty({ example: 'Hand-crafted piece', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 25000.00 })
  price!: number;

  @ApiProperty({ example: 'https://s3.amazonaws.com/...' })
  imageUrl!: string;
}

// ── Step 3 Response ────────────────────────────────────────────────────────

export class Step3ResponseDto {
  @ApiProperty({ example: 'COMPLETED', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: true })
  isOnboarded!: boolean;

  @ApiProperty({ example: 3, required: false })
  itemsAdded?: number;

  @ApiProperty({ example: 3, required: false })
  totalItems?: number;

  @ApiProperty({ type: [ShowcaseItemResponseDto] })
  showcase!: ShowcaseItemResponseDto[];
}

// ── Status Response ────────────────────────────────────────────────────────

export class OnboardingPrefillDto {
  @ApiProperty({ example: 'Rahul' })
  firstName!: string;

  @ApiProperty({ example: 'Sharma' })
  lastName!: string;

  @ApiProperty({ example: 'rahul@gmail.com' })
  email!: string;

  @ApiProperty({ example: '9876543210' })
  mobileNumber!: string;
}

export class OnboardingStatusResponseDto {
  @ApiProperty({ example: 'STEP_1_DONE', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: false })
  isOnboarded!: boolean;

  @ApiProperty({ example: [1], type: [Number] })
  completedSteps!: number[];

  @ApiProperty({ example: 2, nullable: true })
  nextStep!: number | null;

  @ApiProperty({ type: OnboardingPrefillDto, description: 'Prefilled user data from signup for Step 1 display' })
  prefill!: OnboardingPrefillDto;
}

