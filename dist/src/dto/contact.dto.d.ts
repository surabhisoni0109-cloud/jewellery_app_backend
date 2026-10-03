export declare enum InquiryStatusEnum {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED"
}
export declare class UpdateCompanyContactDto {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    supportHours?: string;
}
export declare class CreateContactInquiryDto {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
}
export declare class UpdateInquiryStatusDto {
    status: InquiryStatusEnum;
    adminNote?: string;
}
export declare class InquiryQueryDto {
    page: number;
    limit: number;
    status?: InquiryStatusEnum;
    search?: string;
}
