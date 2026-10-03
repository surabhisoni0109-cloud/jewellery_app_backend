"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContactService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let ContactService = ContactService_1 = class ContactService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ContactService_1.name);
    }
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
    async updateCompanyContact(dto) {
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
    async submitInquiry(dto) {
        const inquiry = await this.prisma.contactInquiry.create({
            data: {
                name: dto.name.trim(),
                email: dto.email.toLowerCase().trim(),
                phone: dto.phone?.trim() || null,
                subject: dto.subject?.trim() || null,
                message: dto.message.trim(),
            },
        });
        this.logger.log(`New user contact inquiry received from "${inquiry.name}" (${inquiry.email})`);
        return {
            success: true,
            message: 'Your inquiry has been received. Our support team will get back to you shortly.',
            inquiryId: inquiry.id,
        };
    }
    async getInquiries(query) {
        const { page = 1, limit = 20, status, search } = query;
        const skip = (page - 1) * limit;
        const where = {};
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
    async updateInquiryStatus(id, dto) {
        const exists = await this.prisma.contactInquiry.findUnique({
            where: { id },
        });
        if (!exists) {
            throw new custom_exception_1.CustomException('Inquiry not found', 'NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        const updated = await this.prisma.contactInquiry.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.adminNote !== undefined && { adminNote: dto.adminNote.trim() }),
            },
        });
        return updated;
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = ContactService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactService);
//# sourceMappingURL=contact.service.js.map