import { PrismaService } from './prisma.service';
import { UpsertContentDto } from '../dto/content.dto';
import { ContentType } from '@prisma/client';
export declare class ContentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    normalizeType(input: string): ContentType;
    getContent(typeOrSlug: string): Promise<{
        type: import(".prisma/client").$Enums.ContentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
    getAllContent(): Promise<{
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
    upsertContent(dto: UpsertContentDto, adminName?: string): Promise<{
        type: import(".prisma/client").$Enums.ContentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        lastUpdatedBy: string | null;
    }>;
}
