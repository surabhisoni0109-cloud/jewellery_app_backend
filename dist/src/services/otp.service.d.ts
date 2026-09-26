import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { ISmsProvider } from './sms/sms-provider.interface';
export interface GeneratedOtpResult {
    mobileNumber: string;
    expiresAt: string;
    devOtp?: string;
}
export declare class OtpService {
    private readonly redisService;
    private readonly configService;
    private readonly smsProvider;
    private readonly hmacSecret;
    private readonly ttlSeconds;
    private readonly maxAttempts;
    private readonly cooldownSeconds;
    private readonly hourlyLimit;
    private readonly exposeDevOtp;
    constructor(redisService: RedisService, configService: ConfigService, smsProvider: ISmsProvider);
    generateRawOtp(): string;
    hashOtp(rawOtp: string): string;
    verifyHash(providedRawOtp: string, expectedHash: string): boolean;
    checkRateLimits(mobileNumber: string, purposeKey: string): Promise<void>;
    registerRateLimitUsage(mobileNumber: string, purposeKey: string): Promise<void>;
    sendSignupOtp(mobileNumber: string, payload: any): Promise<GeneratedOtpResult>;
    sendSigninOtp(type: string, mobileNumber: string, userId: string): Promise<GeneratedOtpResult>;
    verifyOtpAndRetrieveData<T>(purposeKey: string, inputOtp: string): Promise<T>;
}
