import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ContentTypeEnum {
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
  ABOUT_US = 'ABOUT_US',
}

export class UpsertContentDto {
  @ApiProperty({
    description: 'Type of content page',
    enum: ContentTypeEnum,
    example: ContentTypeEnum.PRIVACY_POLICY,
  })
  @IsEnum(ContentTypeEnum, {
    message: 'type must be PRIVACY_POLICY, TERMS_AND_CONDITIONS, or ABOUT_US',
  })
  @IsNotEmpty()
  type!: ContentTypeEnum;

  @ApiProperty({
    description: 'Title of the page',
    example: 'Privacy Policy',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @ApiProperty({
    description: 'Body content (text, markdown, or HTML)',
    example: '# Privacy Policy\n\nYour privacy is important to us...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content!: string;
}

export class ContentItemResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ enum: ContentTypeEnum, example: ContentTypeEnum.PRIVACY_POLICY })
  type!: ContentTypeEnum;

  @ApiProperty({ example: 'Privacy Policy' })
  title!: string;

  @ApiProperty({ example: 'This is the privacy policy...' })
  content!: string;

  @ApiProperty({ example: 'Super Admin', nullable: true })
  lastUpdatedBy?: string | null;

  @ApiProperty({ example: '2026-10-03T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: '2026-10-03T10:00:00.000Z' })
  createdAt!: Date;
}
