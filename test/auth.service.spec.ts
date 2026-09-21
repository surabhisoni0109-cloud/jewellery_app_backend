import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserStatus, UserType } from '@prisma/client';
import { AuthService } from '../src/services/auth.service';
import { UsersService } from '../src/services/users.service';
import { OtpService } from '../src/services/otp.service';
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
    verifyOtpAndRetrieveData: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token_string'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
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
});
