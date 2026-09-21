import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProvider } from './sms-provider.interface';

/**
 * MSG91 SMS Provider Stub Implementation.
 * To activate real SMS sending:
 * 1. Set SMS_PROVIDER=msg91 in .env
 * 2. Configure MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in .env
 * 3. Add HTTP dispatch logic below using axios or fetch.
 */
@Injectable()
export class Msg91SmsProvider implements ISmsProvider {
  private readonly logger = new Logger(Msg91SmsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string, _otp: string): Promise<void> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');

    this.logger.log(
      `[MSG91 SMS Provider Stub] Dispatching OTP to ${mobileNumber}. AuthKey configured: ${!!authKey}, TemplateId configured: ${!!templateId}`,
    );

    // TODO: Implement HTTP POST call to MSG91 v5 OTP API
    // e.g., await fetch(`https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${mobileNumber}&otp=${otp}`, { headers: { authkey: authKey } });
  }
}
