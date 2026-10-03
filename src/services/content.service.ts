import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ContentTypeEnum, UpsertContentDto } from '../dto/content.dto';
import { CustomException } from '../common/exceptions/custom-exception';
import { ContentType } from '@prisma/client';

const DEFAULT_TEMPLATES: Record<ContentType, { title: string; content: string }> = {
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

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to normalize type or slug string to ContentType enum
   */
  public normalizeType(input: string): ContentType {
    const cleaned = input.toUpperCase().replace(/-/g, '_').trim();
    if (cleaned in ContentType) {
      return cleaned as ContentType;
    }
    throw new CustomException(
      `Invalid content type: "${input}". Valid values are: privacy-policy, terms-and-conditions, about-us`,
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Get single content page by type or slug. If it doesn't exist, seeds default template.
   */
  async getContent(typeOrSlug: string) {
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

  /**
   * Get all active content pages in one single call (ideal for app caching).
   */
  async getAllContent() {
    const types: ContentType[] = [
      ContentType.PRIVACY_POLICY,
      ContentType.TERMS_AND_CONDITIONS,
      ContentType.ABOUT_US,
    ];

    const records = await this.prisma.appContent.findMany({
      where: {
        type: { in: types },
      },
    });

    const foundTypes = new Set(records.map((r) => r.type));

    // Seed any missing type so all 3 are always available
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

    // Structure mapped by slug and enum for easy client app consumption
    const mapping: Record<string, any> = {};
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

  /**
   * Create or update content page (Admin)
   */
  async upsertContent(dto: UpsertContentDto, adminName?: string) {
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
}
