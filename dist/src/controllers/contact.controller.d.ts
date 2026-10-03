import { ContactService } from '../services/contact.service';
import { UpdateCompanyContactDto, CreateContactInquiryDto, UpdateInquiryStatusDto, InquiryQueryDto } from '../dto/contact.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    getPublicContactInfo(): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        address: string | null;
        supportHours: string | null;
    }>;
    submitContactInquiry(dto: CreateContactInquiryDto): Promise<{
        success: boolean;
        message: string;
        inquiryId: string;
    }>;
    getAdminContactInfo(): Promise<{
        id: string;
        email: string | null;
        updatedAt: Date;
        phone: string | null;
        whatsapp: string | null;
        address: string | null;
        supportHours: string | null;
    }>;
    updateAdminContactInfo(dto: UpdateCompanyContactDto): Promise<{
        message: string;
        data: {
            id: string;
            email: string | null;
            updatedAt: Date;
            phone: string | null;
            whatsapp: string | null;
            address: string | null;
            supportHours: string | null;
        };
    }>;
    getAdminInquiries(query: InquiryQueryDto): Promise<{
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
        data: {
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
        };
    }>;
}
