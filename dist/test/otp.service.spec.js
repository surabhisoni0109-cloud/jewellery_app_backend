"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const otp_service_1 = require("../src/services/otp.service");
const redis_service_1 = require("../src/services/redis.service");
const sms_provider_interface_1 = require("../src/services/sms/sms-provider.interface");
const custom_exception_1 = require("../src/common/exceptions/custom-exception");
describe('OtpService', () => {
    let service;
    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
        expire: jest.fn(),
    };
    const mockConfigService = {
        get: jest.fn((key, defaultValue) => {
            const configMap = {
                OTP_HMAC_SECRET: 'test_secret_32_characters_minimum_len',
                OTP_TTL_SECONDS: 300,
                OTP_MAX_ATTEMPTS: 5,
                OTP_RESEND_COOLDOWN_SECONDS: 30,
                OTP_HOURLY_LIMIT: 5,
                EXPOSE_OTP_IN_RESPONSE: true,
            };
            return configMap[key] ?? defaultValue;
        }),
    };
    const mockSmsProvider = {
        sendOtp: jest.fn().mockResolvedValue(undefined),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                otp_service_1.OtpService,
                { provide: redis_service_1.RedisService, useValue: mockRedisService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
                { provide: sms_provider_interface_1.SMS_PROVIDER_TOKEN, useValue: mockSmsProvider },
            ],
        }).compile();
        service = module.get(otp_service_1.OtpService);
    });
    describe('generateRawOtp & hashOtp', () => {
        it('should generate a 6-digit numeric OTP', () => {
            const otp = service.generateRawOtp();
            expect(otp).toMatch(/^\d{6}$/);
        });
        it('should consistently hash raw OTP with HMAC-SHA256', () => {
            const rawOtp = '123456';
            const hash1 = service.hashOtp(rawOtp);
            const hash2 = service.hashOtp(rawOtp);
            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64);
        });
        it('should verify correct OTP using timing-safe comparison', () => {
            const rawOtp = '654321';
            const hash = service.hashOtp(rawOtp);
            expect(service.verifyHash(rawOtp, hash)).toBe(true);
            expect(service.verifyHash('111111', hash)).toBe(false);
        });
    });
    describe('checkRateLimits', () => {
        it('should throw OTP_LIMIT_EXCEEDED when in resend cooldown', async () => {
            mockRedisService.get.mockImplementation((key) => {
                if (key.includes('cooldown'))
                    return Promise.resolve('1');
                return Promise.resolve(null);
            });
            await expect(service.checkRateLimits('9876543210', 'signup:9876543210')).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw OTP_LIMIT_EXCEEDED when hourly request limit is exceeded', async () => {
            mockRedisService.get.mockImplementation((key) => {
                if (key.includes('cooldown'))
                    return Promise.resolve(null);
                if (key.includes('hourly'))
                    return Promise.resolve('5');
                return Promise.resolve(null);
            });
            await expect(service.checkRateLimits('9876543210', 'signup:9876543210')).rejects.toThrow(custom_exception_1.CustomException);
        });
    });
    describe('verifyOtpAndRetrieveData', () => {
        it('should throw OTP_EXPIRED when OTP key is missing in Redis', async () => {
            mockRedisService.get.mockResolvedValue(null);
            await expect(service.verifyOtpAndRetrieveData('signup:9876543210', '123456')).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw INVALID_OTP and increment attempt count on wrong OTP', async () => {
            const rawOtp = '123456';
            const wrongOtp = '999999';
            const hash = service.hashOtp(rawOtp);
            mockRedisService.get.mockResolvedValue(JSON.stringify({ hash, payload: {} }));
            mockRedisService.incr.mockResolvedValue(1);
            await expect(service.verifyOtpAndRetrieveData('signup:9876543210', wrongOtp)).rejects.toThrow(custom_exception_1.CustomException);
            expect(mockRedisService.incr).toHaveBeenCalled();
        });
        it('should delete keys and return payload on successful verification', async () => {
            const rawOtp = '123456';
            const hash = service.hashOtp(rawOtp);
            const payload = { firstName: 'Yogesh', mobileNumber: '9876543210' };
            mockRedisService.get.mockResolvedValue(JSON.stringify({ hash, payload }));
            const result = await service.verifyOtpAndRetrieveData('signup:9876543210', rawOtp);
            expect(result.payload).toEqual(payload);
            expect(mockRedisService.del).toHaveBeenCalledWith('otp:signup:9876543210');
            expect(mockRedisService.del).toHaveBeenCalledWith('otp:attempts:signup:9876543210');
        });
        it('should invalidate OTP key when max attempts (5) are reached', async () => {
            const rawOtp = '123456';
            const wrongOtp = '000000';
            const hash = service.hashOtp(rawOtp);
            mockRedisService.get.mockResolvedValue(JSON.stringify({ hash, payload: {} }));
            mockRedisService.incr.mockResolvedValue(5);
            await expect(service.verifyOtpAndRetrieveData('signup:9876543210', wrongOtp)).rejects.toThrow(custom_exception_1.CustomException);
            expect(mockRedisService.del).toHaveBeenCalledWith('otp:signup:9876543210');
        });
    });
    describe('resendSignupOtp', () => {
        it('should throw OTP_EXPIRED when no pending signup payload is found in Redis', async () => {
            mockRedisService.get.mockResolvedValue(null);
            await expect(service.resendSignupOtp('9876543210')).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should generate new OTP and dispatch SMS when pending signup payload exists', async () => {
            const payload = { type: 'USER', firstName: 'John', mobileNumber: '9876543210' };
            mockRedisService.get.mockImplementation((key) => {
                if (key === 'otp:signup:9876543210') {
                    return Promise.resolve(JSON.stringify({ hash: 'old_hash', payload }));
                }
                return Promise.resolve(null);
            });
            const res = await service.resendSignupOtp('9876543210');
            expect(res.mobileNumber).toBe('9876543210');
            expect(mockSmsProvider.sendOtp).toHaveBeenCalled();
            expect(mockRedisService.set).toHaveBeenCalledWith('otp:signup:9876543210', expect.any(String), 300);
        });
    });
});
//# sourceMappingURL=otp.service.spec.js.map