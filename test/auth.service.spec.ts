import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserStatus, UserType } from '@prisma/client';
import { AuthService } from '../src/services/auth.service';
import { UsersService } from '../src/services/users.service';
import { OtpService } from '../src/services/otp.service';
import { RedisService } from '../src/services/redis.service';
import { OtpPurpose } from '../src/dto/resend-otp.dto';
import { CustomException } from '../src/common/exceptions/custom-exception';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    trimInput: jest.fn((str: string) => str.trim()),
    normalizeEmail: jest.fn((str: string) => str.trim().toLowerCase()),
    findByMobileAndType: jest.fn(),
    findByEmailAndType: jest.fn(),
    findByUserId: jest.fn(),
    createUser: jest.fn(),
  };

  const mockOtpService = {
    sendSignupOtp: jest.fn(),
    sendSigninOtp: jest.fn(),
    resendSignupOtp: jest.fn(),
    hasPendingSignup: jest.fn(),
    verifyOtpAndRetrieveData: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token_string'),
    verify: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultVal?: any) => defaultVal),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should throw MOBILE_ALREADY_EXISTS if mobile number is already registered for type', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.signup({
          type: UserType.USER,
          firstName: 'Yogesh',
          lastName: 'Soni',
          mobileNumber: '9876543210',
          email: 'yogesh@example.com',
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw EMAIL_ALREADY_EXISTS if email is already registered for type', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue(null);
      mockUsersService.findByEmailAndType.mockResolvedValue({ id: '1' } as any);

      await expect(
        service.signup({
          type: UserType.USER,
          firstName: 'Yogesh',
          lastName: 'Soni',
          mobileNumber: '9876543210',
          email: 'yogesh@example.com',
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should delegate to OtpService.sendSignupOtp when payload is valid', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue(null);
      mockUsersService.findByEmailAndType.mockResolvedValue(null);
      mockOtpService.sendSignupOtp.mockResolvedValue({
        mobileNumber: '9876543210',
        expiresAt: '2026-09-20T16:00:00.000Z',
        devOtp: '123456',
      });

      const res = await service.signup({
        type: UserType.USER,
        firstName: 'Yogesh',
        lastName: 'Soni',
        mobileNumber: '9876543210',
        email: 'yogesh@example.com',
      });

      expect(res.mobileNumber).toBe('9876543210');
      expect(mockOtpService.sendSignupOtp).toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it('should throw USER_NOT_FOUND when user does not exist', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue(null);

      await expect(
        service.signin({
          type: UserType.USER,
          mobileNumber: '9876543210',
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw ACCOUNT_BLOCKED when user status is BLOCKED', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue({
        id: '1',
        status: UserStatus.BLOCKED,
      } as any);

      await expect(
        service.signin({
          type: UserType.USER,
          mobileNumber: '9876543210',
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should send signin OTP for active user', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue({
        id: '1',
        userId: 'USR100001',
        status: UserStatus.ACTIVE,
      } as any);

      mockOtpService.sendSigninOtp.mockResolvedValue({
        mobileNumber: '9876543210',
        expiresAt: '2026-09-20T16:00:00.000Z',
        devOtp: '123456',
      });

      const res = await service.signin({
        type: UserType.USER,
        mobileNumber: '9876543210',
      });

      expect(res.devOtp).toBe('123456');
    });
  });

  describe('decoupled methods', () => {
    it('issueSessionAfterVerification should generate valid JWT token with claims', async () => {
      const mockUser = {
        userId: 'USR100001',
        type: UserType.USER,
        mobileNumber: '9876543210',
      } as any;

      const session = await service.issueSessionAfterVerification(mockUser);

      expect(session.token).toBe('mocked_jwt_token_string');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'USR100001',
        type: UserType.USER,
        mobileNumber: '9876543210',
      });
    });
  });

  describe('resendOtp', () => {
    it('should delegate to OtpService.resendSignupOtp when purpose is SIGNUP', async () => {
      mockOtpService.resendSignupOtp.mockResolvedValue({
        mobileNumber: '9876543210',
        expiresAt: '2026-09-20T16:00:00.000Z',
      });

      const res = await service.resendOtp({
        type: UserType.USER,
        mobileNumber: '9876543210',
        purpose: OtpPurpose.SIGNUP,
      });

      expect(mockOtpService.resendSignupOtp).toHaveBeenCalledWith('9876543210');
      expect(res.mobileNumber).toBe('9876543210');
    });

    it('should delegate to OtpService.sendSigninOtp when purpose is SIGNIN and user exists', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue({
        id: '1',
        userId: 'USR100001',
        status: UserStatus.ACTIVE,
      } as any);

      mockOtpService.sendSigninOtp.mockResolvedValue({
        mobileNumber: '9876543210',
        expiresAt: '2026-09-20T16:00:00.000Z',
      });

      const res = await service.resendOtp({
        type: UserType.USER,
        mobileNumber: '9876543210',
        purpose: OtpPurpose.SIGNIN,
      });

      expect(mockOtpService.sendSigninOtp).toHaveBeenCalledWith(
        UserType.USER,
        '9876543210',
        'USR100001',
      );
      expect(res.mobileNumber).toBe('9876543210');
    });

    it('should throw USER_NOT_FOUND when purpose is SIGNIN and user is not registered', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue(null);

      await expect(
        service.resendOtp({
          type: UserType.USER,
          mobileNumber: '9876543210',
          purpose: OtpPurpose.SIGNIN,
        }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw ACCOUNT_BLOCKED when purpose is SIGNIN and user is blocked', async () => {
      mockUsersService.findByMobileAndType.mockResolvedValue({
        id: '1',
        userId: 'USR100001',
        status: UserStatus.BLOCKED,
      } as any);

      await expect(
        service.resendOtp({
          type: UserType.USER,
          mobileNumber: '9876543210',
          purpose: OtpPurpose.SIGNIN,
        }),
      ).rejects.toThrow(CustomException);
    });
  });

  describe('refreshToken', () => {
    it('should throw REFRESH_TOKEN_EXPIRED when token expired', async () => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      mockJwtService.verify.mockImplementation(() => {
        throw err;
      });

      await expect(
        service.refreshToken({ refreshToken: 'expired_token' }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw INVALID_REFRESH_TOKEN when token signature is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      await expect(
        service.refreshToken({ refreshToken: 'bad_token' }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw INVALID_REFRESH_TOKEN when token was revoked in Redis', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'USR100001',
        jti: 'jti-123',
        tokenType: 'refresh',
      });
      mockRedisService.get.mockResolvedValue(null); // not found in Redis

      await expect(
        service.refreshToken({ refreshToken: 'revoked_token' }),
      ).rejects.toThrow(CustomException);
    });

    it('should throw ACCOUNT_BLOCKED if user account is blocked upon refresh', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'USR100001',
        jti: 'jti-123',
        tokenType: 'refresh',
      });
      mockRedisService.get.mockResolvedValue('1');
      mockUsersService.findByUserId.mockResolvedValue({
        userId: 'USR100001',
        status: UserStatus.BLOCKED,
      } as any);

      await expect(
        service.refreshToken({ refreshToken: 'valid_token' }),
      ).rejects.toThrow(CustomException);
    });

    it('should successfully rotate tokens for active user', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'USR100001',
        jti: 'old-jti-123',
        tokenType: 'refresh',
      });
      mockRedisService.get.mockResolvedValue('1');
      mockUsersService.findByUserId.mockResolvedValue({
        userId: 'USR100001',
        type: UserType.USER,
        mobileNumber: '9876543210',
        status: UserStatus.ACTIVE,
      } as any);
      mockJwtService.sign
        .mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');

      const result = await service.refreshToken({ refreshToken: 'valid_token' });

      expect(mockRedisService.del).toHaveBeenCalledWith('refresh_token:USR100001:old-jti-123');
      expect(mockRedisService.set).toHaveBeenCalled();
      expect(result.token).toBe('new_access_token');
      expect(result.refreshToken).toBe('new_refresh_token');
      expect(result.tokenType).toBe('Bearer');
    });
  });
});
