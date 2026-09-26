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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const stream_1 = require("stream");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
let S3Service = class S3Service {
    constructor(configService) {
        this.configService = configService;
        this.client = new client_s3_1.S3Client({
            region: this.configService.get('AWS_REGION', 'ap-south-1'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', ''),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', ''),
            },
        });
        this.bucket = this.configService.get('AWS_S3_BUCKET_NAME', '');
    }
    validateFile(file) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new custom_exception_1.CustomException(`Invalid file type "${file.mimetype}". Allowed: jpg, jpeg, png, webp`, 'INVALID_IMAGE', common_1.HttpStatus.BAD_REQUEST);
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new custom_exception_1.CustomException(`File "${file.originalname}" exceeds the maximum allowed size of 5MB`, 'INVALID_IMAGE', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    validateFiles(files) {
        files.forEach((file) => this.validateFile(file));
    }
    async uploadFile(file, key) {
        const stream = stream_1.Readable.from(file.buffer);
        const upload = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream,
                ContentType: file.mimetype,
                ContentDisposition: 'inline',
            },
        });
        await upload.done();
        return `https://${this.bucket}.s3.${this.configService.get('AWS_REGION', 'ap-south-1')}.amazonaws.com/${key}`;
    }
    async uploadFiles(files, keyPrefix) {
        const uploadPromises = files.map((file, index) => {
            const ext = file.originalname.split('.').pop() ?? 'jpg';
            const key = `${keyPrefix}-${index + 1}.${ext}`;
            return this.uploadFile(file, key);
        });
        return Promise.all(uploadPromises);
    }
    async deleteFileByUrl(url) {
        try {
            const urlObj = new URL(url);
            const key = urlObj.pathname.replace(/^\//, '');
            await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        }
        catch {
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map