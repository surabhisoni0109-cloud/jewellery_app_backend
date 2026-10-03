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
exports.ContentItemResponseDto = exports.UpsertContentDto = exports.ContentTypeEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ContentTypeEnum;
(function (ContentTypeEnum) {
    ContentTypeEnum["PRIVACY_POLICY"] = "PRIVACY_POLICY";
    ContentTypeEnum["TERMS_AND_CONDITIONS"] = "TERMS_AND_CONDITIONS";
    ContentTypeEnum["ABOUT_US"] = "ABOUT_US";
})(ContentTypeEnum || (exports.ContentTypeEnum = ContentTypeEnum = {}));
class UpsertContentDto {
}
exports.UpsertContentDto = UpsertContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of content page',
        enum: ContentTypeEnum,
        example: ContentTypeEnum.PRIVACY_POLICY,
    }),
    (0, class_validator_1.IsEnum)(ContentTypeEnum, {
        message: 'type must be PRIVACY_POLICY, TERMS_AND_CONDITIONS, or ABOUT_US',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpsertContentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the page',
        example: 'Privacy Policy',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    __metadata("design:type", String)
], UpsertContentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Body content (text, markdown, or HTML)',
        example: '# Privacy Policy\n\nYour privacy is important to us...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Content is required' }),
    __metadata("design:type", String)
], UpsertContentDto.prototype, "content", void 0);
class ContentItemResponseDto {
}
exports.ContentItemResponseDto = ContentItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' }),
    __metadata("design:type", String)
], ContentItemResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ContentTypeEnum, example: ContentTypeEnum.PRIVACY_POLICY }),
    __metadata("design:type", String)
], ContentItemResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Privacy Policy' }),
    __metadata("design:type", String)
], ContentItemResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'This is the privacy policy...' }),
    __metadata("design:type", String)
], ContentItemResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Super Admin', nullable: true }),
    __metadata("design:type", Object)
], ContentItemResponseDto.prototype, "lastUpdatedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-03T10:00:00.000Z' }),
    __metadata("design:type", Date)
], ContentItemResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-10-03T10:00:00.000Z' }),
    __metadata("design:type", Date)
], ContentItemResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=content.dto.js.map