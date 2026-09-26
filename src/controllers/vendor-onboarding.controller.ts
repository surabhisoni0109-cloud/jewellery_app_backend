import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VendorOnlyGuard } from '../common/guards/vendor-only.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';
import { VendorOnboardingService } from '../services/vendor-onboarding.service';
import { VendorOnboardingStep1Dto } from '../dto/vendor-onboarding-step1.dto';
import { VendorOnboardingStep2Dto } from '../dto/vendor-onboarding-step2.dto';
import { VendorOnboardingStep3Dto } from '../dto/vendor-onboarding-step3.dto';
import {
  Step1ResponseDto,
  Step2ResponseDto,
  Step3ResponseDto,
  OnboardingStatusResponseDto,
} from '../dto/vendor-onboarding-response.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomException } from '../common/exceptions/custom-exception';

const multerMemoryOptions = { storage: memoryStorage() };

// Helper to parse and validate nested JSON body fields from multipart/form-data
async function parseAndValidateDto<T extends object>(
  cls: new () => T,
  body: Record<string, any>,
): Promise<T> {
  // storeLocation comes as JSON string in multipart — parse it
  if (body.storeLocation && typeof body.storeLocation === 'string') {
    try {
      body.storeLocation = JSON.parse(body.storeLocation);
    } catch {
      throw new CustomException(
        'storeLocation must be a valid JSON object',
        'INVALID_LOCATION',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // items comes as JSON string in multipart — parse it
  if (body.items && typeof body.items === 'string') {
    try {
      body.items = JSON.parse(body.items);
    } catch {
      throw new CustomException(
        'items must be a valid JSON array',
        'INVALID_ITEMS',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  const instance = plainToInstance(cls, body, { enableImplicitConversion: true });
  const errors = await validate(instance as object, { whitelist: true, stopAtFirstError: false });

  if (errors.length > 0) {
    // Collect all messages including nested errors
    const collectMessages = (errs: typeof errors): string[] =>
      errs.flatMap((e) => [
        ...Object.values(e.constraints ?? {}),
        ...collectMessages(e.children ?? []),
      ]);

    const messages = collectMessages(errors);
    throw new CustomException(
      messages.length > 0 ? messages.join('; ') : 'Validation failed',
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  }

  return instance;
}


@ApiTags('Vendor Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorOnlyGuard)
@Controller('vendor/onboarding')
export class VendorOnboardingController {
  constructor(private readonly onboardingService: VendorOnboardingService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // GET /vendor/onboarding/status
  // ─────────────────────────────────────────────────────────────────────────

  @Get('status')
  @ApiOperation({
    summary: 'Get Vendor Onboarding Status',
    description: 'Returns the current onboarding step and list of completed steps for the authenticated vendor.',
  })
  @ApiWrappedResponse(OnboardingStatusResponseDto, 200, 'Onboarding status fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only endpoint (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async getOnboardingStatus(@CurrentUser() user: User) {
    const data = await this.onboardingService.getOnboardingStatus(user.userId);
    return { message: 'Onboarding status fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /vendor/onboarding/step-1
  // ─────────────────────────────────────────────────────────────────────────

  @Get('step-1')
  @ApiOperation({
    summary: 'Get Step 1 — Personal Profile',
    description: 'Fetch saved personal profile details (gender, date of birth, profile picture) and user account info.',
  })
  @ApiWrappedResponse(Step1ResponseDto, 200, 'Personal profile fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async getStep1(@CurrentUser() user: User) {
    const data = await this.onboardingService.getStep1(user.userId);
    return { message: 'Personal profile fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /vendor/onboarding/step-1
  // ─────────────────────────────────────────────────────────────────────────

  @Patch('step-1')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profilePicture', multerMemoryOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Step 1 — Personal Profile',
    description: 'Submit or update personal profile info: gender, date of birth, and optional profile picture.',
  })
  @ApiBody({ type: VendorOnboardingStep1Dto })
  @ApiWrappedResponse(Step1ResponseDto, 200, 'Personal profile updated successfully')
  @ApiResponse({ status: 400, description: 'Validation error (INVALID_IMAGE, UNDERAGE)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async updateStep1(
    @CurrentUser() user: User,
    @Body() rawBody: Record<string, any>,
    @UploadedFile() profilePicture?: Express.Multer.File,
  ) {
    const dto = await parseAndValidateDto(VendorOnboardingStep1Dto, rawBody);
    const data = await this.onboardingService.updateStep1(user.userId, dto, profilePicture);
    return { message: 'Personal profile updated successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /vendor/onboarding/step-2
  // ─────────────────────────────────────────────────────────────────────────

  @Get('step-2')
  @ApiOperation({
    summary: 'Get Step 2 — Store Profile',
    description:
      'Fetch saved store profile details (name, description, logo, cover images, location, pricing, contact details, timings, and founding year).',
  })
  @ApiWrappedResponse(Step2ResponseDto, 200, 'Store profile fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async getStep2(@CurrentUser() user: User) {
    const data = await this.onboardingService.getStep2(user.userId);
    return { message: 'Store profile fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /vendor/onboarding/step-2
  // ─────────────────────────────────────────────────────────────────────────

  @Patch('step-2')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'storeLogo', maxCount: 1 },
        { name: 'storeCoverImages', maxCount: 5 },
      ],
      multerMemoryOptions,
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Step 2 — Store Profile',
    description:
      'Submit or update store info: name, description, logo, cover images (up to 5), location, pricing, contact details, timings, and founding year.',
  })
  @ApiBody({ type: VendorOnboardingStep2Dto })
  @ApiWrappedResponse(Step2ResponseDto, 200, 'Store profile updated successfully')
  @ApiResponse({ status: 400, description: 'Validation error (INVALID_IMAGE, INVALID_LOCATION, INVALID_TIME_RANGE, TOO_MANY_IMAGES)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async updateStep2(
    @CurrentUser() user: User,
    @Body() rawBody: Record<string, any>,
    @UploadedFiles()
    files?: {
      storeLogo?: Express.Multer.File[];
      storeCoverImages?: Express.Multer.File[];
    },
  ) {
    const dto = await parseAndValidateDto(VendorOnboardingStep2Dto, rawBody);
    const data = await this.onboardingService.updateStep2(
      user.userId,
      dto,
      files?.storeLogo?.[0],
      files?.storeCoverImages,
    );
    return { message: 'Store profile updated successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /vendor/onboarding/step-3
  // ─────────────────────────────────────────────────────────────────────────

  @Get('step-3')
  @ApiOperation({
    summary: 'Get Step 3 — Jewellery Showcase',
    description: 'Fetch all jewellery showcase items for the authenticated vendor.',
  })
  @ApiWrappedResponse(Step3ResponseDto, 200, 'Jewellery showcase fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async getStep3(@CurrentUser() user: User) {
    const data = await this.onboardingService.getStep3(user.userId);
    return { message: 'Jewellery showcase fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /vendor/onboarding/step-3
  // ─────────────────────────────────────────────────────────────────────────

  @Post('step-3')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images', 5, multerMemoryOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Step 3 — Jewellery Showcase',
    description:
      'Add up to 5 jewellery items (additively, max 5 total). Each item requires: image file, title, and price. Description is optional. Send `items` as a JSON-stringified array.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['items', 'images'],
      properties: {
        items: {
          type: 'string',
          example:
            '[{"title":"Kundan Necklace","description":"Hand-crafted","price":25000},{"title":"Gold Ring","price":5000}]',
          description: 'JSON-stringified array of jewellery items (title, description?, price)',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Image files in the same order as items array (max 5 files, 5MB each)',
        },
      },
    },
  })
  @ApiWrappedResponse(Step3ResponseDto, 200, 'Jewellery showcase items added successfully')
  @ApiResponse({ status: 400, description: 'Validation error (INVALID_IMAGE, SHOWCASE_LIMIT_REACHED)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async addShowcaseItems(
    @CurrentUser() user: User,
    @Body() rawBody: Record<string, any>,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    const dto = await parseAndValidateDto(VendorOnboardingStep3Dto, rawBody);
    const data = await this.onboardingService.addShowcaseItems(user.userId, dto, images ?? []);
    return { message: 'Jewellery showcase items added successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /vendor/onboarding/showcase/:itemId
  // ─────────────────────────────────────────────────────────────────────────

  @Delete('showcase/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Showcase Item',
    description: 'Removes a jewellery showcase item by ID (also deletes the image from S3).',
  })
  @ApiParam({ name: 'itemId', description: 'UUID of the showcase item to delete' })
  @ApiResponse({ status: 200, description: 'Showcase item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Item not found (SHOWCASE_ITEM_NOT_FOUND)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor-only (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async deleteShowcaseItem(
    @CurrentUser() user: User,
    @Param('itemId') itemId: string,
  ) {
    const data = await this.onboardingService.deleteShowcaseItem(user.userId, itemId);
    return { message: 'Showcase item deleted successfully', data };
  }
}
