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
var ContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
const client_1 = require("@prisma/client");
const DEFAULT_TEMPLATES = {
    PRIVACY_POLICY: {
        title: 'Privacy Policy',
        content: `## Privacy Policy

Last updated: October 2026

Welcome to Jewellery Marketplace. We value your trust and are committed to protecting your personal information.

### 1. Information We Collect
We collect personal information that you provide when registering, including:
- Name, mobile number, and email address
- Profile details and store information for registered vendors
- Device tokens and usage analytics to provide notifications and improve service

### 2. How We Use Your Information
- To facilitate transactions and enquiries between buyers and vendors
- To provide customer support and service updates
- To send important push notifications and authentication OTPs

### 3. Data Protection
We employ industry-standard encryption, strict access controls, and secure data storage to safeguard your information.

### 4. Contact Us
If you have any questions about this Privacy Policy, please reach out via our Contact Us section.`,
    },
    TERMS_AND_CONDITIONS: {
        title: 'Terms and Conditions',
        content: `## Terms and Conditions

Last updated: October 2026

Please read these Terms and Conditions carefully before using the Jewellery Marketplace application and services.

### 1. Acceptance of Terms
By accessing or using our marketplace, you agree to be bound by these terms. If you disagree with any part, you may not access our services.

### 2. User & Vendor Accounts
- Users must provide accurate, complete, and current registration information.
- Vendors must ensure all jewellery showcase items, pricing, and descriptions are genuine and compliant with local jewellery regulations.

### 3. Showcases & Enquiries
- Jewellery items showcased represent vendor collections. Final pricing, certification, and delivery terms are established directly between buyer and vendor.
- Any fraudulent or misleading showcase items will result in immediate account termination.

### 4. Limitation of Liability
Jewellery Marketplace serves as an authenticated platform connecting buyers and trusted jewellers. We do not manufacture or directly sell jewellery items unless explicitly specified.`,
    },
    ABOUT_US: {
        title: 'About Us',
        content: `## About Jewellery Marketplace

Connecting connoisseurs of fine jewellery with India's most trusted artisans and master jewellers.

### Our Vision
To build a seamless, secure, and transparent digital gateway where buyers discover exceptional jewellery craftsmanship—from timeless gold and diamond heirlooms to contemporary artisan collections.

### What We Offer
- **Verified Jewellers:** Curated jewellery stores verified with authentic business credentials.
- **Direct Showcases:** Explore daily collections, newly launched ornaments, and heritage masterworks directly from reputable store owners.
- **Effortless Connection:** Inquire directly with jewellers, receive personalized quotes, and visit their authentic retail stores.`,
    },
};
let ContentService = ContentService_1 = class ContentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ContentService_1.name);
    }
    normalizeType(input) {
        const cleaned = input.toUpperCase().replace(/-/g, '_').trim();
        if (cleaned in client_1.ContentType) {
            return cleaned;
        }
        throw new custom_exception_1.CustomException(`Invalid content type: "${input}". Valid values are: privacy-policy, terms-and-conditions, about-us`, 'VALIDATION_ERROR', common_1.HttpStatus.BAD_REQUEST);
    }
    async getContent(typeOrSlug) {
        const type = this.normalizeType(typeOrSlug);
        let contentRecord = await this.prisma.appContent.findUnique({
            where: { type },
        });
        if (!contentRecord) {
            const defaultData = DEFAULT_TEMPLATES[type];
            contentRecord = await this.prisma.appContent.create({
                data: {
                    type,
                    title: defaultData.title,
                    content: defaultData.content,
                    lastUpdatedBy: 'System Default',
                },
            });
            this.logger.log(`Seeded default content for ${type}`);
        }
        return contentRecord;
    }
    async getAllContent() {
        const types = [
            client_1.ContentType.PRIVACY_POLICY,
            client_1.ContentType.TERMS_AND_CONDITIONS,
            client_1.ContentType.ABOUT_US,
        ];
        const records = await this.prisma.appContent.findMany({
            where: {
                type: { in: types },
            },
        });
        const foundTypes = new Set(records.map((r) => r.type));
        for (const t of types) {
            if (!foundTypes.has(t)) {
                const def = DEFAULT_TEMPLATES[t];
                const newRecord = await this.prisma.appContent.create({
                    data: {
                        type: t,
                        title: def.title,
                        content: def.content,
                        lastUpdatedBy: 'System Default',
                    },
                });
                records.push(newRecord);
            }
        }
        const mapping = {};
        for (const item of records) {
            const slug = item.type.toLowerCase().replace(/_/g, '-');
            mapping[item.type] = item;
            mapping[slug] = item;
        }
        return {
            pages: records,
            byType: mapping,
        };
    }
    async upsertContent(dto, adminName) {
        const type = this.normalizeType(dto.type);
        const record = await this.prisma.appContent.upsert({
            where: { type },
            update: {
                title: dto.title.trim(),
                content: dto.content,
                lastUpdatedBy: adminName || 'Admin',
                updatedAt: new Date(),
            },
            create: {
                type,
                title: dto.title.trim(),
                content: dto.content,
                lastUpdatedBy: adminName || 'Admin',
            },
        });
        this.logger.log(`Content for ${type} updated by ${adminName || 'Admin'}`);
        return record;
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map