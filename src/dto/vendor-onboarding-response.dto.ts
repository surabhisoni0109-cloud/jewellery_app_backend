import { ApiProperty } from '@nestjs/swagger';
import { OnboardingStep, Gender } from '@prisma/client';

// ── Step 1 Response ────────────────────────────────────────────────────────

export class Step1ResponseDto {
  @ApiProperty({ example: 'STEP_1_DONE', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: 'MALE', enum: Gender })
  gender!: Gender;

  @ApiProperty({ example: '1995-06-15' })
  dob!: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/vendors/VND100001/profile.jpg', nullable: true })
  profilePicture!: string | null;
}

// ── Step 2 Response ────────────────────────────────────────────────────────

export class Step2ResponseDto {
  @ApiProperty({ example: 'STEP_2_DONE', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: 'Soni Jewellers' })
  storeName!: string;

  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/vendors/VND100001/logo.jpg', nullable: true })
  storeLogo!: string | null;

  @ApiProperty({ type: [String], example: ['https://s3.amazonaws.com/...'] })
  storeCoverImages!: string[];

  @ApiProperty({ example: { city: 'Jaipur', state: 'Rajasthan', country: 'India' } })
  storeLocation!: object;
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

  @ApiProperty({ example: 3 })
  itemsAdded!: number;

  @ApiProperty({ type: [ShowcaseItemResponseDto] })
  showcase!: ShowcaseItemResponseDto[];
}

// ── Status Response ────────────────────────────────────────────────────────

export class OnboardingStatusResponseDto {
  @ApiProperty({ example: 'STEP_1_DONE', enum: OnboardingStep })
  onboardingStep!: OnboardingStep;

  @ApiProperty({ example: false })
  isOnboarded!: boolean;

  @ApiProperty({ example: [1], type: [Number] })
  completedSteps!: number[];

  @ApiProperty({ example: 2, nullable: true })
  nextStep!: number | null;
}
