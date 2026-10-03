import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  UpdateCompanyContactDto,
  CreateContactInquiryDto,
  UpdateInquiryStatusDto,
  InquiryQueryDto,
} from '../dto/contact.dto';
import { CustomException } from '../common/exceptions/custom-exception';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get official company contact information (Public & Admin)
   */
  async getCompanyContact() {
    let contact = await this.prisma.companyContact.findUnique({
      where: { id: 'default' },
    });

    if (!contact) {
      contact = await this.prisma.companyContact.create({
        data: {
          id: 'default',
          email: 'support@jewelleryapp.com',
          phone: '+91 98765 43210',
          whatsapp: '+91 98765 43210',
          address: '123 Jewellery Lane, Zaveri Bazaar, Mumbai, Maharashtra 400002',
          supportHours: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
        },
      });
      this.logger.log('Created default company contact information');
    }

    return contact;
  }

  /**
   * Update official company contact information (Admin)
   */
  async updateCompanyContact(dto: UpdateCompanyContactDto) {
    const updated = await this.prisma.companyContact.upsert({
      where: { id: 'default' },
      update: {
        ...(dto.email !== undefined && { email: dto.email.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp.trim() }),
        ...(dto.address !== undefined && { address: dto.address.trim() }),
        ...(dto.supportHours !== undefined && {
          supportHours: dto.supportHours.trim(),
        }),
      },
      create: {
        id: 'default',
        email: dto.email?.trim() || null,
        phone: dto.phone?.trim() || null,
        whatsapp: dto.whatsapp?.trim() || null,
        address: dto.address?.trim() || null,
        supportHours: dto.supportHours?.trim() || null,
      },
    });

    this.logger.log('Company contact information updated');
    return updated;
  }

  /**
   * Submit an inquiry from a mobile app user (Public)
   */
  async submitInquiry(dto: CreateContactInquiryDto) {
    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone?.trim() || null,
        subject: dto.subject?.trim() || null,
        message: dto.message.trim(),
      },
    });

    this.logger.log(
      `New user contact inquiry received from "${inquiry.name}" (${inquiry.email})`,
    );
    return {
      success: true,
      message:
        'Your inquiry has been received. Our support team will get back to you shortly.',
      inquiryId: inquiry.id,
    };
  }

  /**
   * Get paginated user inquiries (Admin)
   */
  async getInquiries(query: InquiryQueryDto) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total, pendingCount] = await Promise.all([
      this.prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contactInquiry.count({ where }),
      this.prisma.contactInquiry.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return {
      inquiries,
      total,
      pendingCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Update status or add resolution notes to an inquiry (Admin)
   */
  async updateInquiryStatus(id: string, dto: UpdateInquiryStatusDto) {
    const exists = await this.prisma.contactInquiry.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new CustomException(
        'Inquiry not found',
        'NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    const updated = await this.prisma.contactInquiry.update({
      where: { id },
      data: {
        status: dto.status as any,
        ...(dto.adminNote !== undefined && { adminNote: dto.adminNote.trim() }),
      },
    });

    return updated;
  }
}
