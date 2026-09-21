import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProvider } from './sms-provider.interface';

/**
 * Twilio SMS Provider Stub Implementation.
 * To activate real SMS sending:
 * 1. Set SMS_PROVIDER=twilio in .env
 * 2. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env
 * 3. Add Twilio SDK dispatch logic below.
 */
@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string, _otp: string): Promise<void> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    this.logger.log(
      `[Twilio SMS Provider Stub] Dispatching OTP to ${mobileNumber}. AccountSid configured: ${!!accountSid}, AuthToken configured: ${!!authToken}, From: ${fromNumber}`,
    );

    // TODO: Implement Twilio Messages API dispatch logic
  }
}
