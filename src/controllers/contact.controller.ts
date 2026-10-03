import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContactService } from '../services/contact.service';
import {
  UpdateCompanyContactDto,
  CreateContactInquiryDto,
  UpdateInquiryStatusDto,
  InquiryQueryDto,
} from '../dto/contact.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Contact Us')
@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // ── Public Endpoints (App Side) ───────────────────────────────────

  @Get('contact/info')
  @ApiOperation({
    summary: 'Get official company contact details',
    description:
      'Fetches company email, helpline, WhatsApp, address, and support hours for display in the mobile app.',
  })
  @ApiResponse({ status: 200, description: 'Company contact info retrieved' })
  async getPublicContactInfo() {
    return this.contactService.getCompanyContact();
  }

  @Post('contact/submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit customer contact inquiry',
    description:
      'Allows mobile app users or visitors to submit a contact inquiry or question to the marketplace support team.',
  })
  @ApiResponse({
    status: 201,
    description: 'Inquiry submitted successfully',
  })
  async submitContactInquiry(@Body() dto: CreateContactInquiryDto) {
    return this.contactService.submitInquiry(dto);
  }

  // ── Admin Endpoints (Company Details & Inquiries Management) ──────

  @Get('admin/contact/info')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Admin - Get official company contact information' })
  async getAdminContactInfo() {
    return this.contactService.getCompanyContact();
  }

  @Put('admin/contact/info')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Admin - Update official company contact details',
  })
  async updateAdminContactInfo(@Body() dto: UpdateCompanyContactDto) {
    const updated = await this.contactService.updateCompanyContact(dto);
    return {
      message: 'Company contact information updated successfully',
      data: updated,
    };
  }

  @Get('admin/contact/inquiries')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Admin - List customer contact inquiries with pagination and filters',
  })
  async getAdminInquiries(@Query() query: InquiryQueryDto) {
    return this.contactService.getInquiries(query);
  }

  @Patch('admin/contact/inquiries/:id/status')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Admin - Update inquiry resolution status and note',
  })
  async updateInquiryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    const updated = await this.contactService.updateInquiryStatus(id, dto);
    return {
      message: 'Inquiry status updated successfully',
      data: updated,
    };
  }
}
