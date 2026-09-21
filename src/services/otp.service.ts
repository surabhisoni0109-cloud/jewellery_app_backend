import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RedisService } from './redis.service';
import { ISmsProvider, SMS_PROVIDER_TOKEN } from './sms/sms-provider.interface';
import { CustomException } from '../common/exceptions/custom-exception';

export interface GeneratedOtpResult {
  mobileNumber: string;
  expiresAt: string;
  devOtp?: string;
}

@Injectable()
export class OtpService {
  private readonly hmacSecret: string;
  private readonly ttlSeconds: number;
  private readonly maxAttempts: number;
  private readonly cooldownSeconds: number;
  private readonly hourlyLimit: number;
  private readonly exposeDevOtp: boolean;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject(SMS_PROVIDER_TOKEN) private readonly smsProvider: ISmsProvider,
  ) {
    this.hmacSecret = this.configService.get<string>('OTP_HMAC_SECRET', 'default_secret_32_chars_long');
    this.ttlSeconds = this.configService.get<number>('OTP_TTL_SECONDS', 300);
    this.maxAttempts = this.configService.get<number>('OTP_MAX_ATTEMPTS', 5);
    this.cooldownSeconds = this.configService.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);
    this.hourlyLimit = this.configService.get<number>('OTP_HOURLY_LIMIT', 5);
    this.exposeDevOtp = this.configService.get<boolean>('EXPOSE_OTP_IN_RESPONSE', false);
  }

  /**
   * Generates a 6-digit numeric OTP using crypto.randomInt.
   */
  public generateRawOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes the raw OTP using HMAC-SHA256.
   */
  public hashOtp(rawOtp: string): string {
    return crypto.createHmac('sha256', this.hmacSecret).update(rawOtp).digest('hex');
  }

  /**
   * Compares two hex hashes using crypto.timingSafeEqual.
   */
  public verifyHash(providedRawOtp: string, expectedHash: string): boolean {
    const providedHash = this.hashOtp(providedRawOtp);
    const bufProvided = Buffer.from(providedHash, 'hex');
    const bufExpected = Buffer.from(expectedHash, 'hex');

    if (bufProvided.length !== bufExpected.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufProvided, bufExpected);
  }

  /**
   * Checks rate limiting rules (hourly limit and resend cooldown).
   */
  public async checkRateLimits(mobileNumber: string, purposeKey: string): Promise<void> {
    // 1. Check Resend Cooldown
    const cooldownKey = `otp:cooldown:${purposeKey}`;
    const isInCooldown = await this.redisService.get(cooldownKey);
    if (isInCooldown) {
      throw new CustomException(
        `Please wait ${this.cooldownSeconds} seconds before requesting a new OTP`,
        'OTP_LIMIT_EXCEEDED',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check Hourly Limit
    const hourlyKey = `otp:hourly:${mobileNumber}`;
    const hourlyCountStr = await this.redisService.get(hourlyKey);
    const hourlyCount = hourlyCountStr ? parseInt(hourlyCountStr, 10) : 0;

    if (hourlyCount >= this.hourlyLimit) {
      throw new CustomException(
        'Maximum OTP requests per hour exceeded. Please try again later.',
        'OTP_LIMIT_EXCEEDED',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Increments rate limit counters after OTP generation.
   */
  public async registerRateLimitUsage(mobileNumber: string, purposeKey: string): Promise<void> {
    // Set Cooldown Flag
    const cooldownKey = `otp:cooldown:${purposeKey}`;
    await this.redisService.set(cooldownKey, '1', this.cooldownSeconds);

    // Increment Hourly Counter
    const hourlyKey = `otp:hourly:${mobileNumber}`;
    const currentCount = await this.redisService.incr(hourlyKey);
    if (currentCount === 1) {
      await this.redisService.expire(hourlyKey, 3600); // 1 hour TTL
    }
  }

  /**
   * Generates and dispatches OTP for pending Signup payload.
   */
  async sendSignupOtp(mobileNumber: string, payload: any): Promise<GeneratedOtpResult> {
    const purposeKey = `signup:${mobileNumber}`;
    await this.checkRateLimits(mobileNumber, purposeKey);

    const rawOtp = this.generateRawOtp();
    const hash = this.hashOtp(rawOtp);

    const otpKey = `otp:${purposeKey}`;
    const attemptKey = `otp:attempts:${purposeKey}`;

    const dataToStore = JSON.stringify({ hash, payload });

    await this.redisService.set(otpKey, dataToStore, this.ttlSeconds);
    await this.redisService.del(attemptKey); // Reset failed attempts

    await this.registerRateLimitUsage(mobileNumber, purposeKey);

    // Dispatch SMS via provider
    await this.smsProvider.sendOtp(mobileNumber, rawOtp);

    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000).toISOString();

    const result: GeneratedOtpResult = {
      mobileNumber,
      expiresAt,
    };

    if (this.exposeDevOtp) {
      result.devOtp = rawOtp;
    }

    return result;
  }

  /**
   * Generates and dispatches OTP for Signin process.
   */
  async sendSigninOtp(type: string, mobileNumber: string, userId: string): Promise<GeneratedOtpResult> {
    const purposeKey = `signin:${type}:${mobileNumber}`;
    await this.checkRateLimits(mobileNumber, purposeKey);

    const rawOtp = this.generateRawOtp();
    const hash = this.hashOtp(rawOtp);

    const otpKey = `otp:${purposeKey}`;
    const attemptKey = `otp:attempts:${purposeKey}`;

    const dataToStore = JSON.stringify({ hash, userId, type, mobileNumber });

    await this.redisService.set(otpKey, dataToStore, this.ttlSeconds);
    await this.redisService.del(attemptKey); // Reset failed attempts

    await this.registerRateLimitUsage(mobileNumber, purposeKey);

    // Dispatch SMS via provider
    await this.smsProvider.sendOtp(mobileNumber, rawOtp);

    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000).toISOString();

    const result: GeneratedOtpResult = {
      mobileNumber,
      expiresAt,
    };

    if (this.exposeDevOtp) {
      result.devOtp = rawOtp;
    }

    return result;
  }

  /**
   * Verifies an OTP for Signup or Signin.
   * On success: deletes OTP and attempt keys, returns stored data payload.
   * On failure: increments attempt count (invalidates key if >= maxAttempts).
   */
  async verifyOtpAndRetrieveData<T>(purposeKey: string, inputOtp: string): Promise<T> {
    const otpKey = `otp:${purposeKey}`;
    const attemptKey = `otp:attempts:${purposeKey}`;

    const storedDataRaw = await this.redisService.get(otpKey);

    if (!storedDataRaw) {
      throw new CustomException(
        'OTP expired or not found. Please request a new OTP.',
        'OTP_EXPIRED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const parsedData = JSON.parse(storedDataRaw);
    const expectedHash = parsedData.hash;

    const isValid = this.verifyHash(inputOtp, expectedHash);

    if (!isValid) {
      // Increment attempt counter
      const attempts = await this.redisService.incr(attemptKey);
      if (attempts === 1) {
        await this.redisService.expire(attemptKey, this.ttlSeconds);
      }

      if (attempts >= this.maxAttempts) {
        // Invalidate OTP immediately upon exceeding max attempts
        await this.redisService.del(otpKey);
        await this.redisService.del(attemptKey);
        throw new CustomException(
          'Maximum OTP verification attempts exceeded. Please request a new OTP.',
          'INVALID_OTP',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new CustomException(
        'Invalid OTP provided. Please check and try again.',
        'INVALID_OTP',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Success: Delete single-use OTP & attempt keys
    await this.redisService.del(otpKey);
    await this.redisService.del(attemptKey);

    return parsedData;
  }
}
