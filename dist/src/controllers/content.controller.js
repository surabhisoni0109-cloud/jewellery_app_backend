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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const content_service_1 = require("../services/content.service");
const content_dto_1 = require("../dto/content.dto");
const admin_jwt_guard_1 = require("../common/guards/admin-jwt.guard");
let ContentController = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    async getAllPublicContent() {
        return this.contentService.getAllContent();
    }
    async getPublicContent(type) {
        return this.contentService.getContent(type);
    }
    async getAdminAllContent() {
        return this.contentService.getAllContent();
    }
    async getAdminContent(type) {
        return this.contentService.getContent(type);
    }
    async upsertContent(dto, req) {
        const adminName = req.user?.name || req.user?.email || 'Admin';
        const updated = await this.contentService.upsertContent(dto, adminName);
        return {
            message: `${dto.title} updated and published successfully`,
            data: updated,
        };
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)('content'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all content pages',
        description: 'Fetches Privacy Policy, Terms & Conditions, and About Us in one request. Suitable for app caching.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All content pages retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getAllPublicContent", null);
__decorate([
    (0, common_1.Get)('content/:type'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get single content page by slug or type',
        description: 'Fetches a single page by type or slug (e.g. "privacy-policy", "terms-and-conditions", "about-us", or "PRIVACY_POLICY").',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Content page retrieved' }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getPublicContent", null);
__decorate([
    (0, common_1.Get)('admin/content'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin - List all content pages' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getAdminAllContent", null);
__decorate([
    (0, common_1.Get)('admin/content/:type'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin - Get single content page' }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getAdminContent", null);
__decorate([
    (0, common_1.Post)('admin/content'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Admin - Create or edit content page (Privacy Policy, Terms, About Us)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Content published successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [content_dto_1.UpsertContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "upsertContent", null);
exports.ContentController = ContentController = __decorate([
    (0, swagger_1.ApiTags)('Content Management'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map