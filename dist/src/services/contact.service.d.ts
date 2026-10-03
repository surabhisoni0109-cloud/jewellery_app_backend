import { PrismaService } from './prisma.service';
import { UpdateCompanyContactDto, CreateContactInquiryDto, UpdateInquiryStatusDto, InquiryQueryDto } from '../dto/contact.dto';
export declare class ContactService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCompanyContact(): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        address: string | null;
        supportHours: string | null;
    }>;
    updateCompanyContact(dto: UpdateCompanyContactDto): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        address: string | null;
        supportHours: string | null;
    }>;
    submitInquiry(dto: CreateContactInquiryDto): Promise<{
        success: boolean;
        message: string;
        inquiryId: string;
    }>;
    getInquiries(query: InquiryQueryDto): Promise<{
        inquiries: {
            message: string;
            name: string;
            id: string;
            email: string;
            status: import(".prisma/client").$Enums.InquiryStatus;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            subject: string | null;
            adminNote: string | null;
        }[];
        total: number;
        pendingCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateInquiryStatus(id: string, dto: UpdateInquiryStatusDto): Promise<{
        message: string;
        name: string;
        id: string;
        email: string;
        status: import(".prisma/client").$Enums.InquiryStatus;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        subject: string | null;
        adminNote: string | null;
    }>;
}
