import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContentService } from '../services/content.service';
import { UpsertContentDto } from '../dto/content.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Content Management')
@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ── Public Endpoints (App Side) ───────────────────────────────────

  @Get('content')
  @ApiOperation({
    summary: 'Get all content pages',
    description:
      'Fetches Privacy Policy, Terms & Conditions, and About Us in one request. Suitable for app caching.',
  })
  @ApiResponse({ status: 200, description: 'All content pages retrieved' })
  async getAllPublicContent() {
    return this.contentService.getAllContent();
  }

  @Get('content/:type')
  @ApiOperation({
    summary: 'Get single content page by slug or type',
    description:
      'Fetches a single page by type or slug (e.g. "privacy-policy", "terms-and-conditions", "about-us", or "PRIVACY_POLICY").',
  })
  @ApiResponse({ status: 200, description: 'Content page retrieved' })
  async getPublicContent(@Param('type') type: string) {
    return this.contentService.getContent(type);
  }

  // ── Admin Endpoints (CMS / Management) ────────────────────────────

  @Get('admin/content')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Admin - List all content pages' })
  async getAdminAllContent() {
    return this.contentService.getAllContent();
  }

  @Get('admin/content/:type')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Admin - Get single content page' })
  async getAdminContent(@Param('type') type: string) {
    return this.contentService.getContent(type);
  }

  @Post('admin/content')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin - Create or edit content page (Privacy Policy, Terms, About Us)',
  })
  @ApiResponse({ status: 200, description: 'Content published successfully' })
  async upsertContent(@Body() dto: UpsertContentDto, @Req() req: any) {
    const adminName = req.user?.name || req.user?.email || 'Admin';
    const updated = await this.contentService.upsertContent(dto, adminName);
    return {
      message: `${dto.title} updated and published successfully`,
      data: updated,
    };
  }
}
