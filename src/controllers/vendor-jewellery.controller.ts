import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VendorOnlyGuard } from '../common/guards/vendor-only.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';
import { JewelleryService } from '../services/jewellery.service';
import {
  CreateJewelleryDto,
  UpdateJewelleryDto,
  JewelleryQueryDto,
  JewelleryResponseDto,
} from '../dto/jewellery.dto';

@ApiTags('Vendor Jewellery')
@Controller()
export class VendorJewelleryController {
  constructor(private readonly jewelleryService: JewelleryService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // 1. ADD JEWELLERY (POST /api/vendor/jewellery)
  // ─────────────────────────────────────────────────────────────────────────

  @Post('vendor/jewellery')
  @UseGuards(JwtAuthGuard, VendorOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Add Jewellery Item (Vendor)',
    description:
      'Creates a new jewellery product with up to 5 images, specifications (type, weight, purity, gender), occasion details, and optional discount.',
  })
  @ApiWrappedResponse(JewelleryResponseDto, 201, 'Jewellery created successfully')
  @ApiResponse({ status: 400, description: 'Validation error (INVALID_IMAGE, TOO_MANY_IMAGES)', type: ApiErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Vendor account required (VENDOR_ONLY)', type: ApiErrorResponseDto })
  async createJewellery(
    @CurrentUser() user: User,
    @Body() dto: CreateJewelleryDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const data = await this.jewelleryService.createJewellery(
      user.userId,
      dto,
      files,
    );
    return {
      message: 'Jewellery item added successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. GET ALL VENDOR JEWELLERY (GET /api/vendor/jewellery)
  // ─────────────────────────────────────────────────────────────────────────

  @Get('vendor/jewellery')
  @UseGuards(JwtAuthGuard, VendorOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get All Jewellery Items (Vendor)',
    description:
      'Returns paginated list of all jewellery products owned by the authenticated vendor with search and filtering.',
  })
  async getVendorJewellery(
    @CurrentUser() user: User,
    @Query() query: JewelleryQueryDto,
  ) {
    const data = await this.jewelleryService.getVendorJewellery(
      user.userId,
      query,
    );
    return {
      message: 'Jewellery inventory retrieved successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GET SINGLE JEWELLERY ITEM (GET /api/vendor/jewellery/:id)
  // ─────────────────────────────────────────────────────────────────────────

  @Get('vendor/jewellery/:id')
  @UseGuards(JwtAuthGuard, VendorOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Single Jewellery Item by ID (Vendor)',
    description: 'Fetches complete specifications of a specific jewellery item.',
  })
  @ApiResponse({ status: 404, description: 'Item not found (SHOWCASE_ITEM_NOT_FOUND)', type: ApiErrorResponseDto })
  async getJewelleryById(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.jewelleryService.getJewelleryById(user.userId, id);
    return {
      message: 'Jewellery details retrieved successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. EDIT / UPDATE JEWELLERY (PUT /api/vendor/jewellery/:id)
  // ─────────────────────────────────────────────────────────────────────────

  @Put('vendor/jewellery/:id')
  @UseGuards(JwtAuthGuard, VendorOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Edit / Update Jewellery Item (Vendor)',
    description:
      'Updates an existing jewellery item specifications, discount, occasion, and images.',
  })
  @ApiResponse({ status: 404, description: 'Item not found', type: ApiErrorResponseDto })
  async updateJewellery(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateJewelleryDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const data = await this.jewelleryService.updateJewellery(
      user.userId,
      id,
      dto,
      files,
    );
    return {
      message: 'Jewellery item updated successfully',
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DELETE JEWELLERY (DELETE /api/vendor/jewellery/:id)
  // ─────────────────────────────────────────────────────────────────────────

  @Delete('vendor/jewellery/:id')
  @UseGuards(JwtAuthGuard, VendorOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Jewellery Item (Vendor)',
    description:
      'Permanently deletes a jewellery item and removes all its images from cloud storage.',
  })
  @ApiResponse({ status: 404, description: 'Item not found', type: ApiErrorResponseDto })
  async deleteJewellery(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.jewelleryService.deleteJewellery(user.userId, id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. PUBLIC MARKETPLACE ENDPOINTS (For Buyer App & Visitors)
  // ─────────────────────────────────────────────────────────────────────────

  @Get('jewellery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public Marketplace Jewellery Feed (Buyer App)',
    description:
      'Public endpoint to fetch published jewellery items across stores or for a specific vendor.',
  })
  async getPublicJewellery(
    @Query() query: JewelleryQueryDto,
    @Query('vendorProfileId') vendorProfileId?: string,
  ) {
    const data = await this.jewelleryService.getPublicJewellery(
      query,
      vendorProfileId,
    );
    return {
      message: 'Marketplace jewellery fetched successfully',
      data,
    };
  }

  @Get('jewellery/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public Jewellery Item Details (Buyer App)',
    description: 'Public endpoint to view single jewellery item and seller info.',
  })
  async getPublicJewelleryById(@Param('id') id: string) {
    const data = await this.jewelleryService.getPublicJewelleryById(id);
    return {
      message: 'Jewellery details fetched successfully',
      data,
    };
  }
}
