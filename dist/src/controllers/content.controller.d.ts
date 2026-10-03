import { ContentService } from '../services/content.service';
import { UpsertContentDto } from '../dto/content.dto';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getAllPublicContent(): Promise<{
        pages: {
            type: import(".prisma/client").$Enums.ContentType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            lastUpdatedBy: string | null;
        }[];
        byType: Record<string, any>;
    }>;
    getPublicContent(type: string): Promise<{
        type: import(".prisma/client").$Enums.ContentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    getAdminAllContent(): Promise<{
        pages: {
            type: import(".prisma/client").$Enums.ContentType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            lastUpdatedBy: string | null;
        }[];
        byType: Record<string, any>;
    }>;
    getAdminContent(type: string): Promise<{
        type: import(".prisma/client").$Enums.ContentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    upsertContent(dto: UpsertContentDto, req: any): Promise<{
        message: string;
        data: {
            type: import(".prisma/client").$Enums.ContentType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            lastUpdatedBy: string | null;
        };
    }>;
}
