import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../common/guards/user-only.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';
import { UserOnboardingService } from '../services/user-onboarding.service';
import {
  UserOnboardingDto,
  UserOnboardingResponseDto,
} from '../dto/user-onboarding.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomException } from '../common/exceptions/custom-exception';

const multerMemoryOptions = { storage: memoryStorage() };

async function parseAndValidateDto<T extends object>(
  cls: new () => T,
  body: Record<string, any>,
): Promise<T> {
  // location comes as JSON string in multipart — parse it
  if (body.location && typeof body.location === 'string') {
    try {
      body.location = JSON.parse(body.location);
    } catch {
      throw new CustomException(
        'location must be a valid JSON object',
        'INVALID_LOCATION',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  const instance = plainToInstance(cls, body, { enableImplicitConversion: true });
  const errors = await validate(instance as object, { whitelist: true, stopAtFirstError: false });

  if (errors.length > 0) {
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

@ApiTags('User Onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, UserOnlyGuard)
@Controller('user/onboarding')
export class UserOnboardingController {
  constructor(private readonly onboardingService: UserOnboardingService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/user/onboarding
  // ─────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get User Onboarding Profile',
    description: 'Fetch saved onboarding profile details (gender, date of birth, profile picture, location) and user account info for the authenticated buyer.',
  })
  @ApiWrappedResponse(UserOnboardingResponseDto, 200, 'User onboarding details fetched successfully')
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Restricted to customer accounts (USER_ONLY)', type: ApiErrorResponseDto })
  async getOnboarding(@CurrentUser() user: User) {
    const data = await this.onboardingService.getOnboarding(user.userId);
    return { message: 'User onboarding details fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/user/onboarding
  // ─────────────────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profilePicture', multerMemoryOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Submit User Onboarding',
    description: 'Submit onboarding info for buyer: firstName, lastName, email, gender, date of birth, location, and optional profile picture. Note: mobileNumber cannot be updated.',
  })
  @ApiBody({ type: UserOnboardingDto })
  @ApiWrappedResponse(UserOnboardingResponseDto, 200, 'User onboarding completed successfully')
  @ApiResponse({ status: 400, description: 'Validation error (INVALID_IMAGE, UNDERAGE, MOBILE_NUMBER_READ_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Email conflict (EMAIL_ALREADY_EXISTS)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Restricted to customer accounts (USER_ONLY)', type: ApiErrorResponseDto })
  async submitOnboarding(
    @CurrentUser() user: User,
    @Body() rawBody: Record<string, any>,
    @UploadedFile() profilePicture?: Express.Multer.File,
  ) {
    const dto = await parseAndValidateDto(UserOnboardingDto, rawBody);
    const data = await this.onboardingService.submitOnboarding(user.userId, dto, profilePicture);
    return { message: 'User onboarding completed successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /api/user/onboarding (alias)
  // ─────────────────────────────────────────────────────────────────────────

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profilePicture', multerMemoryOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update User Onboarding (Patch)',
    description: 'Update onboarding info for buyer: firstName, lastName, email, gender, date of birth, location, and optional profile picture.',
  })
  @ApiBody({ type: UserOnboardingDto })
  @ApiWrappedResponse(UserOnboardingResponseDto, 200, 'User onboarding updated successfully')
  @ApiResponse({ status: 400, description: 'Validation error', type: ApiErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ApiErrorResponseDto })
  async updateOnboarding(
    @CurrentUser() user: User,
    @Body() rawBody: Record<string, any>,
    @UploadedFile() profilePicture?: Express.Multer.File,
  ) {
    const dto = await parseAndValidateDto(UserOnboardingDto, rawBody);
    const data = await this.onboardingService.submitOnboarding(user.userId, dto, profilePicture);
    return { message: 'User onboarding updated successfully', data };
  }
}
