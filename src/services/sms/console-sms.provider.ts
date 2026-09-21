import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProvider } from './sms-provider.interface';

@Injectable()
export class ConsoleSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string, otp: string): Promise<void> {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (isProduction) {
      // Never log OTP in production
      this.logger.log(`[SMS Sent] Dispatching OTP SMS to mobile: ${mobileNumber}`);
    } else {
      this.logger.log(`[CONSOLE SMS PROVIDER] OTP for ${mobileNumber} is: ${otp}`);
    }
  }
}
