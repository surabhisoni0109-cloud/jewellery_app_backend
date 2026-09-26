import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private readonly configService;
    private readonly client;
    private readonly bucket;
    constructor(configService: ConfigService);
    validateFile(file: Express.Multer.File): void;
    validateFiles(files: Express.Multer.File[]): void;
    uploadFile(file: Express.Multer.File, key: string): Promise<string>;
    uploadFiles(files: Express.Multer.File[], keyPrefix: string): Promise<string[]>;
    deleteFileByUrl(url: string): Promise<void>;
}
