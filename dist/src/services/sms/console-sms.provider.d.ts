import { ConfigService } from '@nestjs/config';
import { ISmsProvider } from './sms-provider.interface';
export declare class ConsoleSmsProvider implements ISmsProvider {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOtp(mobileNumber: string, otp: string): Promise<void>;
}
