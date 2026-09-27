import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OtpService } from '../src/services/otp.service';
import { RedisService } from '../src/services/redis.service';
import { SMS_PROVIDER_TOKEN } from '../src/services/sms/sms-provider.interface';
import { CustomException } from '../src/common/exceptions/custom-exception';

describe('OtpService', () => {
  let service: OtpService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      const configMap: Record<string, any> = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SMS_PROVIDER_TOKEN, useValue: mockSmsProvider },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
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
      expect(hash1).toHaveLength(64); // SHA-256 hex string length
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
      mockRedisService.get.mockImplementation((key: string) => {
        if (key.includes('cooldown')) return Promise.resolve('1');
        return Promise.resolve(null);
      });

      await expect(service.checkRateLimits('9876543210', 'signup:9876543210')).rejects.toThrow(
        CustomException,
      );
    });

    it('should throw OTP_LIMIT_EXCEEDED when hourly request limit is exceeded', async () => {
      mockRedisService.get.mockImplementation((key: string) => {
        if (key.includes('cooldown')) return Promise.resolve(null);
        if (key.includes('hourly')) return Promise.resolve('5'); // max limit reached
        return Promise.resolve(null);
      });

      await expect(service.checkRateLimits('9876543210', 'signup:9876543210')).rejects.toThrow(
        CustomException,
      );
    });
  });

  describe('verifyOtpAndRetrieveData', () => {
    it('should throw OTP_EXPIRED when OTP key is missing in Redis', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await expect(
        service.verifyOtpAndRetrieveData('signup:9876543210', '123456'),
      ).rejects.toThrow(CustomException);
    });

    it('should throw INVALID_OTP and increment attempt count on wrong OTP', async () => {
      const rawOtp = '123456';
      const wrongOtp = '999999';
      const hash = service.hashOtp(rawOtp);

      mockRedisService.get.mockResolvedValue(JSON.stringify({ hash, payload: {} }));
      mockRedisService.incr.mockResolvedValue(1);

      await expect(
        service.verifyOtpAndRetrieveData('signup:9876543210', wrongOtp),
      ).rejects.toThrow(CustomException);

      expect(mockRedisService.incr).toHaveBeenCalled();
    });

    it('should delete keys and return payload on successful verification', async () => {
      const rawOtp = '123456';
      const hash = service.hashOtp(rawOtp);
      const payload = { firstName: 'Yogesh', mobileNumber: '9876543210' };

      mockRedisService.get.mockResolvedValue(JSON.stringify({ hash, payload }));

      const result = await service.verifyOtpAndRetrieveData<{ payload: any }>(
        'signup:9876543210',
        rawOtp,
      );

      expect(result.payload).toEqual(payload);
      expect(mockRedisService.del).toHaveBeenCalledWith('otp:signup:9876543210');
      expect(mockRedisService.del).toHaveBeenCalledWith('otp:attempts:signup:9876543210');
    });

    it('should invalidate OTP key when max attempts (5) are reached', async () => {
      const rawOtp = '123456';
      const wrongOtp = '000000';
      const hash = service.hashOtp(rawOtp);

      mockRedisService.get.mockResolvedValue(JSON.stringify({ hash, payload: {} }));
      mockRedisService.incr.mockResolvedValue(5); // 5th failed attempt

      await expect(
        service.verifyOtpAndRetrieveData('signup:9876543210', wrongOtp),
      ).rejects.toThrow(CustomException);

      expect(mockRedisService.del).toHaveBeenCalledWith('otp:signup:9876543210');
    });
  });

  describe('resendSignupOtp', () => {
    it('should throw OTP_EXPIRED when no pending signup payload is found in Redis', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await expect(service.resendSignupOtp('9876543210')).rejects.toThrow(CustomException);
    });

    it('should generate new OTP and dispatch SMS when pending signup payload exists', async () => {
      const payload = { type: 'USER', firstName: 'John', mobileNumber: '9876543210' };
      mockRedisService.get.mockImplementation((key: string) => {
        if (key === 'otp:signup:9876543210') {
          return Promise.resolve(JSON.stringify({ hash: 'old_hash', payload }));
        }
        return Promise.resolve(null);
      });

      const res = await service.resendSignupOtp('9876543210');

      expect(res.mobileNumber).toBe('9876543210');
      expect(mockSmsProvider.sendOtp).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'otp:signup:9876543210',
        expect.any(String),
        300,
      );
    });
  });
});
