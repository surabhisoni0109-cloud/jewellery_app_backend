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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contact_service_1 = require("../services/contact.service");
const contact_dto_1 = require("../dto/contact.dto");
const admin_jwt_guard_1 = require("../common/guards/admin-jwt.guard");
let ContactController = class ContactController {
    constructor(contactService) {
        this.contactService = contactService;
    }
    async getPublicContactInfo() {
        return this.contactService.getCompanyContact();
    }
    async submitContactInquiry(dto) {
        return this.contactService.submitInquiry(dto);
    }
    async getAdminContactInfo() {
        return this.contactService.getCompanyContact();
    }
    async updateAdminContactInfo(dto) {
        const updated = await this.contactService.updateCompanyContact(dto);
        return {
            message: 'Company contact information updated successfully',
            data: updated,
        };
    }
    async getAdminInquiries(query) {
        return this.contactService.getInquiries(query);
    }
    async updateInquiryStatus(id, dto) {
        const updated = await this.contactService.updateInquiryStatus(id, dto);
        return {
            message: 'Inquiry status updated successfully',
            data: updated,
        };
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Get)('contact/info'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get official company contact details',
        description: 'Fetches company email, helpline, WhatsApp, address, and support hours for display in the mobile app.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company contact info retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "getPublicContactInfo", null);
__decorate([
    (0, common_1.Post)('contact/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit customer contact inquiry',
        description: 'Allows mobile app users or visitors to submit a contact inquiry or question to the marketplace support team.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Inquiry submitted successfully',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateContactInquiryDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "submitContactInquiry", null);
__decorate([
    (0, common_1.Get)('admin/contact/info'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin - Get official company contact information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "getAdminContactInfo", null);
__decorate([
    (0, common_1.Put)('admin/contact/info'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin - Update official company contact details',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.UpdateCompanyContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "updateAdminContactInfo", null);
__decorate([
    (0, common_1.Get)('admin/contact/inquiries'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin - List customer contact inquiries with pagination and filters',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.InquiryQueryDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "getAdminInquiries", null);
__decorate([
    (0, common_1.Patch)('admin/contact/inquiries/:id/status'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin - Update inquiry resolution status and note',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.UpdateInquiryStatusDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "updateInquiryStatus", null);
exports.ContactController = ContactController = __decorate([
    (0, swagger_1.ApiTags)('Contact Us'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map