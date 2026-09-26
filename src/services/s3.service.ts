import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { CustomException } from '../common/exceptions/custom-exception';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'ap-south-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME', '');
  }

  /**
   * Validates a single uploaded file (mime-type and size).
   */
  validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new CustomException(
        `Invalid file type "${file.mimetype}". Allowed: jpg, jpeg, png, webp`,
        'INVALID_IMAGE',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new CustomException(
        `File "${file.originalname}" exceeds the maximum allowed size of 5MB`,
        'INVALID_IMAGE',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates multiple uploaded files.
   */
  validateFiles(files: Express.Multer.File[]): void {
    files.forEach((file) => this.validateFile(file));
  }

  /**
   * Uploads a single file to S3 and returns the public URL.
   * @param file  - Multer file object
   * @param key   - S3 object key (e.g. vendors/VND100001/profile.jpg)
   */
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const stream = Readable.from(file.buffer);

    const upload = new Upload({
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

    return `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION', 'ap-south-1')}.amazonaws.com/${key}`;
  }

  /**
   * Uploads multiple files concurrently and returns an array of public URLs.
   */
  async uploadFiles(files: Express.Multer.File[], keyPrefix: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const ext = file.originalname.split('.').pop() ?? 'jpg';
      const key = `${keyPrefix}-${index + 1}.${ext}`;
      return this.uploadFile(file, key);
    });
    return Promise.all(uploadPromises);
  }

  /**
   * Deletes a file from S3 by its full URL.
   */
  async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Extract key from URL: https://bucket.s3.region.amazonaws.com/KEY
      const urlObj = new URL(url);
      const key = urlObj.pathname.replace(/^\//, '');

      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch {
      // Non-critical: log but do not throw
    }
  }
}
