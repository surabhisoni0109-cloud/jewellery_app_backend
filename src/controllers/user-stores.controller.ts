import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../common/guards/user-only.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';
import { UserStoresService } from '../services/user-stores.service';
import {
  StoreQueryDto,
  StoreListItemDto,
  StoreDetailsDto,
  StoreJewelleryQueryDto,
  StoreJewelleryItemDto,
  StoreRatingsQueryDto,
  StoreReviewItemDto,
  CreateStoreRatingDto,
  CreateStoreEnquiryDto,
} from '../dto/user-stores.dto';

@ApiTags('User Stores')
@Controller('user/stores')
export class UserStoresController {
  constructor(private readonly userStoresService: UserStoresService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/user/stores
  // ─────────────────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Discover Jewellery Stores',
    description:
      'List onboarded jewellery stores. If the user is logged in, automatically personalizes and sorts by nearest stores using their saved profile location (like big apps). Supports search by store UUID, vendor ID, name, or area.',
  })
  @ApiResponse({ status: 200, description: 'Stores discovered successfully' })
  async getStores(
    @Query() query: StoreQueryDto,
    @CurrentUser() user?: User,
  ) {
    const data = await this.userStoresService.getStores(query, user?.userId);
    return { message: 'Stores discovered successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/user/stores/:storeId
  // ─────────────────────────────────────────────────────────────────────────

  @Get(':storeId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get Store Details Page',
    description:
      'Fetches complete store profile, cover images, contact details, timings, address, and ratings breakdown. Automatically registers store view and computes distance if user has saved location.',
  })
  @ApiParam({ name: 'storeId', description: 'Store UUID or public vendor ID (e.g. VND100001)' })
  @ApiWrappedResponse(StoreDetailsDto, 200, 'Store details fetched successfully')
  @ApiResponse({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getStoreDetails(
    @Param('storeId') storeId: string,
    @CurrentUser() user?: User,
  ) {
    const data = await this.userStoresService.getStoreDetails(
      storeId,
      user?.userId,
    );
    return { message: 'Store details fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/user/stores/:storeId/jewellery
  // ─────────────────────────────────────────────────────────────────────────

  @Get(':storeId/jewellery')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get Store Jewellery Catalog',
    description: 'Fetch published jewellery pieces for a store with filtering by type, gender, discounts, and pagination.',
  })
  @ApiParam({ name: 'storeId', description: 'Store UUID or public vendor ID' })
  @ApiResponse({ status: 200, description: 'Store jewellery catalog fetched successfully' })
  @ApiResponse({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getStoreJewellery(
    @Param('storeId') storeId: string,
    @Query() query: StoreJewelleryQueryDto,
  ) {
    const data = await this.userStoresService.getStoreJewellery(storeId, query);
    return { message: 'Store jewellery catalog fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/user/stores/:storeId/ratings
  // ─────────────────────────────────────────────────────────────────────────

  @Get(':storeId/ratings')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get Store Ratings & Reviews',
    description: 'Fetch review list with reviewer name, profile image, star score, comment, and overall star distribution.',
  })
  @ApiParam({ name: 'storeId', description: 'Store UUID or public vendor ID' })
  @ApiResponse({ status: 200, description: 'Store reviews fetched successfully' })
  @ApiResponse({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async getStoreRatings(
    @Param('storeId') storeId: string,
    @Query() query: StoreRatingsQueryDto,
  ) {
    const data = await this.userStoresService.getStoreRatings(storeId, query);
    return { message: 'Store reviews fetched successfully', data };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/user/stores/:storeId/ratings
  // ─────────────────────────────────────────────────────────────────────────

  @Post(':storeId/ratings')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserOnlyGuard)
  @ApiOperation({
    summary: 'Rate & Review Store',
    description: 'Submit or update a rating (1-5 stars) and review text for this store. Restricted to buyer accounts.',
  })
  @ApiParam({ name: 'storeId', description: 'Store UUID or public vendor ID' })
  @ApiBody({ type: CreateStoreRatingDto })
  @ApiResponse({ status: 200, description: 'Review submitted or updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Customer only (USER_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Store not found (PROFILE_NOT_FOUND)', type: ApiErrorResponseDto })
  async createOrUpdateRating(
    @CurrentUser() user: User,
    @Param('storeId') storeId: string,
    @Body() dto: CreateStoreRatingDto,
  ) {
    const data = await this.userStoresService.createOrUpdateRating(
      user.userId,
      storeId,
      dto,
    );
    return { message: data.message, data: data.rating };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/user/stores/:storeId/enquiry
  // ─────────────────────────────────────────────────────────────────────────

  @Post(':storeId/enquiry')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserOnlyGuard)
  @ApiOperation({
    summary: 'Send Store Enquiry',
    description:
      'Submit an enquiry to the store (general enquiry or for a specific jewellery item). Auto-attaches customer name, mobile, and profile image.',
  })
  @ApiParam({ name: 'storeId', description: 'Store UUID or public vendor ID' })
  @ApiBody({ type: CreateStoreEnquiryDto })
  @ApiResponse({ status: 201, description: 'Enquiry sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Customer only (USER_ONLY)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Store or item not found', type: ApiErrorResponseDto })
  async createEnquiry(
    @CurrentUser() user: User,
    @Param('storeId') storeId: string,
    @Body() dto: CreateStoreEnquiryDto,
  ) {
    const data = await this.userStoresService.createEnquiry(
      user.userId,
      storeId,
      dto,
    );
    return { message: 'Enquiry sent successfully', data };
  }
}
