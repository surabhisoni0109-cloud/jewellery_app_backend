export declare enum ContentTypeEnum {
    PRIVACY_POLICY = "PRIVACY_POLICY",
    TERMS_AND_CONDITIONS = "TERMS_AND_CONDITIONS",
    ABOUT_US = "ABOUT_US"
}
export declare class UpsertContentDto {
    type: ContentTypeEnum;
    title: string;
    content: string;
}
export declare class ContentItemResponseDto {
    id: string;
    type: ContentTypeEnum;
    title: string;
    content: string;
    lastUpdatedBy?: string | null;
    updatedAt: Date;
    createdAt: Date;
}
