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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const redis_service_1 = require("./redis.service");
const sms_provider_interface_1 = require("./sms/sms-provider.interface");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let OtpService = class OtpService {
    constructor(redisService, configService, smsProvider) {
        this.redisService = redisService;
        this.configService = configService;
        this.smsProvider = smsProvider;
        this.hmacSecret = this.configService.get('OTP_HMAC_SECRET', 'default_secret_32_chars_long');
        this.ttlSeconds = this.configService.get('OTP_TTL_SECONDS', 300);
        this.maxAttempts = this.configService.get('OTP_MAX_ATTEMPTS', 5);
        this.cooldownSeconds = this.configService.get('OTP_RESEND_COOLDOWN_SECONDS', 30);
        this.hourlyLimit = this.configService.get('OTP_HOURLY_LIMIT', 5);
        this.exposeDevOtp = this.configService.get('EXPOSE_OTP_IN_RESPONSE', false);
    }
    generateRawOtp() {
        return crypto.randomInt(100000, 1000000).toString();
    }
    hashOtp(rawOtp) {
        return crypto.createHmac('sha256', this.hmacSecret).update(rawOtp).digest('hex');
    }
    verifyHash(providedRawOtp, expectedHash) {
        const providedHash = this.hashOtp(providedRawOtp);
        const bufProvided = Buffer.from(providedHash, 'hex');
        const bufExpected = Buffer.from(expectedHash, 'hex');
        if (bufProvided.length !== bufExpected.length) {
            return false;
        }
        return crypto.timingSafeEqual(bufProvided, bufExpected);
    }
    async checkRateLimits(mobileNumber, purposeKey) {
        const cooldownKey = `otp:cooldown:${purposeKey}`;
        const isInCooldown = await this.redisService.get(cooldownKey);
        if (isInCooldown) {
            throw new custom_exception_1.CustomException(`Please wait ${this.cooldownSeconds} seconds before requesting a new OTP`, 'OTP_LIMIT_EXCEEDED', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const hourlyKey = `otp:hourly:${mobileNumber}`;
        const hourlyCountStr = await this.redisService.get(hourlyKey);
        const hourlyCount = hourlyCountStr ? parseInt(hourlyCountStr, 10) : 0;
        if (hourlyCount >= this.hourlyLimit) {
            throw new custom_exception_1.CustomException('Maximum OTP requests per hour exceeded. Please try again later.', 'OTP_LIMIT_EXCEEDED', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    async registerRateLimitUsage(mobileNumber, purposeKey) {
        const cooldownKey = `otp:cooldown:${purposeKey}`;
        await this.redisService.set(cooldownKey, '1', this.cooldownSeconds);
        const hourlyKey = `otp:hourly:${mobileNumber}`;
        const currentCount = await this.redisService.incr(hourlyKey);
        if (currentCount === 1) {
            await this.redisService.expire(hourlyKey, 3600);
        }
    }
    async sendSignupOtp(mobileNumber, payload) {
        const purposeKey = `signup:${mobileNumber}`;
        await this.checkRateLimits(mobileNumber, purposeKey);
        const rawOtp = this.generateRawOtp();
        const hash = this.hashOtp(rawOtp);
        const otpKey = `otp:${purposeKey}`;
        const attemptKey = `otp:attempts:${purposeKey}`;
        const dataToStore = JSON.stringify({ hash, payload });
        await this.redisService.set(otpKey, dataToStore, this.ttlSeconds);
        await this.redisService.del(attemptKey);
        await this.registerRateLimitUsage(mobileNumber, purposeKey);
        await this.smsProvider.sendOtp(mobileNumber, rawOtp);
        const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000).toISOString();
        const result = {
            mobileNumber,
            expiresAt,
        };
        if (this.exposeDevOtp) {
            result.devOtp = rawOtp;
        }
        return result;
    }
    async sendSigninOtp(type, mobileNumber, userId) {
        const purposeKey = `signin:${type}:${mobileNumber}`;
        await this.checkRateLimits(mobileNumber, purposeKey);
        const rawOtp = this.generateRawOtp();
        const hash = this.hashOtp(rawOtp);
        const otpKey = `otp:${purposeKey}`;
        const attemptKey = `otp:attempts:${purposeKey}`;
        const dataToStore = JSON.stringify({ hash, userId, type, mobileNumber });
        await this.redisService.set(otpKey, dataToStore, this.ttlSeconds);
        await this.redisService.del(attemptKey);
        await this.registerRateLimitUsage(mobileNumber, purposeKey);
        await this.smsProvider.sendOtp(mobileNumber, rawOtp);
        const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000).toISOString();
        const result = {
            mobileNumber,
            expiresAt,
        };
        if (this.exposeDevOtp) {
            result.devOtp = rawOtp;
        }
        return result;
    }
    async verifyOtpAndRetrieveData(purposeKey, inputOtp) {
        const otpKey = `otp:${purposeKey}`;
        const attemptKey = `otp:attempts:${purposeKey}`;
        const storedDataRaw = await this.redisService.get(otpKey);
        if (!storedDataRaw) {
            throw new custom_exception_1.CustomException('OTP expired or not found. Please request a new OTP.', 'OTP_EXPIRED', common_1.HttpStatus.BAD_REQUEST);
        }
        const parsedData = JSON.parse(storedDataRaw);
        const expectedHash = parsedData.hash;
        const isValid = this.verifyHash(inputOtp, expectedHash);
        if (!isValid) {
            const attempts = await this.redisService.incr(attemptKey);
            if (attempts === 1) {
                await this.redisService.expire(attemptKey, this.ttlSeconds);
            }
            if (attempts >= this.maxAttempts) {
                await this.redisService.del(otpKey);
                await this.redisService.del(attemptKey);
                throw new custom_exception_1.CustomException('Maximum OTP verification attempts exceeded. Please request a new OTP.', 'INVALID_OTP', common_1.HttpStatus.BAD_REQUEST);
            }
            throw new custom_exception_1.CustomException('Invalid OTP provided. Please check and try again.', 'INVALID_OTP', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.redisService.del(otpKey);
        await this.redisService.del(attemptKey);
        return parsedData;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(sms_provider_interface_1.SMS_PROVIDER_TOKEN)),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        config_1.ConfigService, Object])
], OtpService);
//# sourceMappingURL=otp.service.js.map