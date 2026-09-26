import { ConfigService } from '@nestjs/config';
import { ISmsProvider } from './sms-provider.interface';
export declare class TwilioSmsProvider implements ISmsProvider {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOtp(mobileNumber: string, _otp: string): Promise<void>;
}
