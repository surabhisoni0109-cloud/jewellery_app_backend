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
exports.InquiryQueryDto = exports.UpdateInquiryStatusDto = exports.CreateContactInquiryDto = exports.UpdateCompanyContactDto = exports.InquiryStatusEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var InquiryStatusEnum;
(function (InquiryStatusEnum) {
    InquiryStatusEnum["PENDING"] = "PENDING";
    InquiryStatusEnum["RESOLVED"] = "RESOLVED";
})(InquiryStatusEnum || (exports.InquiryStatusEnum = InquiryStatusEnum = {}));
class UpdateCompanyContactDto {
}
exports.UpdateCompanyContactDto = UpdateCompanyContactDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Official support contact email address',
        example: 'support@jewelleryapp.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid support email' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyContactDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer helpline phone number',
        example: '+91 98765 43210',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyContactDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Official WhatsApp customer service number',
        example: '+91 98765 43210',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyContactDto.prototype, "whatsapp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Physical store/office address',
        example: '123 Jewellery Lane, Zaveri Bazaar, Mumbai, Maharashtra 400002',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyContactDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Support operational hours',
        example: 'Mon - Sat: 10:00 AM - 7:00 PM IST',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyContactDto.prototype, "supportHours", void 0);
class CreateContactInquiryDto {
}
exports.CreateContactInquiryDto = CreateContactInquiryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of customer submitting the inquiry',
        example: 'Aarav Patel',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    __metadata("design:type", String)
], CreateContactInquiryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer email address',
        example: 'aarav.patel@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], CreateContactInquiryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Customer mobile/phone number',
        example: '9876543210',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactInquiryDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Subject of the inquiry',
        example: 'Question regarding custom jewellery order',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateContactInquiryDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Inquiry message details',
        example: 'Hello, I would like to inquire about customizing an 18K gold ring.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Message is required' }),
    __metadata("design:type", String)
], CreateContactInquiryDto.prototype, "message", void 0);
class UpdateInquiryStatusDto {
}
exports.UpdateInquiryStatusDto = UpdateInquiryStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: InquiryStatusEnum,
        example: InquiryStatusEnum.RESOLVED,
    }),
    (0, class_validator_1.IsEnum)(InquiryStatusEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateInquiryStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Internal admin resolution note',
        example: 'Called customer on 3rd Oct and answered ring customization details.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateInquiryStatusDto.prototype, "adminNote", void 0);
class InquiryQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.InquiryQueryDto = InquiryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InquiryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], InquiryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: InquiryStatusEnum,
        description: 'Filter inquiries by status',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(InquiryStatusEnum),
    __metadata("design:type", String)
], InquiryQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search inquiries by customer name, email, or subject',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InquiryQueryDto.prototype, "search", void 0);
//# sourceMappingURL=contact.dto.js.map