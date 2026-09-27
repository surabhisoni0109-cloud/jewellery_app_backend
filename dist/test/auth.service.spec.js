"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const auth_service_1 = require("../src/services/auth.service");
const users_service_1 = require("../src/services/users.service");
const otp_service_1 = require("../src/services/otp.service");
const redis_service_1 = require("../src/services/redis.service");
const resend_otp_dto_1 = require("../src/dto/resend-otp.dto");
const custom_exception_1 = require("../src/common/exceptions/custom-exception");
describe('AuthService', () => {
    let service;
    const mockUsersService = {
        trimInput: jest.fn((str) => str.trim()),
        normalizeEmail: jest.fn((str) => str.trim().toLowerCase()),
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
        get: jest.fn((key, defaultVal) => defaultVal),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: users_service_1.UsersService, useValue: mockUsersService },
                { provide: otp_service_1.OtpService, useValue: mockOtpService },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: redis_service_1.RedisService, useValue: mockRedisService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
    });
    describe('signup', () => {
        it('should throw MOBILE_ALREADY_EXISTS if mobile number is already registered for type', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue({ id: '1' });
            await expect(service.signup({
                type: client_1.UserType.USER,
                firstName: 'Yogesh',
                lastName: 'Soni',
                mobileNumber: '9876543210',
                email: 'yogesh@example.com',
            })).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw EMAIL_ALREADY_EXISTS if email is already registered for type', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue(null);
            mockUsersService.findByEmailAndType.mockResolvedValue({ id: '1' });
            await expect(service.signup({
                type: client_1.UserType.USER,
                firstName: 'Yogesh',
                lastName: 'Soni',
                mobileNumber: '9876543210',
                email: 'yogesh@example.com',
            })).rejects.toThrow(custom_exception_1.CustomException);
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
                type: client_1.UserType.USER,
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
            await expect(service.signin({
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
            })).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw ACCOUNT_BLOCKED when user status is BLOCKED', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue({
                id: '1',
                status: client_1.UserStatus.BLOCKED,
            });
            await expect(service.signin({
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
            })).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should send signin OTP for active user', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue({
                id: '1',
                userId: 'USR100001',
                status: client_1.UserStatus.ACTIVE,
            });
            mockOtpService.sendSigninOtp.mockResolvedValue({
                mobileNumber: '9876543210',
                expiresAt: '2026-09-20T16:00:00.000Z',
                devOtp: '123456',
            });
            const res = await service.signin({
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
            });
            expect(res.devOtp).toBe('123456');
        });
    });
    describe('decoupled methods', () => {
        it('issueSessionAfterVerification should generate valid JWT token with claims', async () => {
            const mockUser = {
                userId: 'USR100001',
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
            };
            const session = await service.issueSessionAfterVerification(mockUser);
            expect(session.token).toBe('mocked_jwt_token_string');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: 'USR100001',
                type: client_1.UserType.USER,
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
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
                purpose: resend_otp_dto_1.OtpPurpose.SIGNUP,
            });
            expect(mockOtpService.resendSignupOtp).toHaveBeenCalledWith('9876543210');
            expect(res.mobileNumber).toBe('9876543210');
        });
        it('should delegate to OtpService.sendSigninOtp when purpose is SIGNIN and user exists', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue({
                id: '1',
                userId: 'USR100001',
                status: client_1.UserStatus.ACTIVE,
            });
            mockOtpService.sendSigninOtp.mockResolvedValue({
                mobileNumber: '9876543210',
                expiresAt: '2026-09-20T16:00:00.000Z',
            });
            const res = await service.resendOtp({
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
                purpose: resend_otp_dto_1.OtpPurpose.SIGNIN,
            });
            expect(mockOtpService.sendSigninOtp).toHaveBeenCalledWith(client_1.UserType.USER, '9876543210', 'USR100001');
            expect(res.mobileNumber).toBe('9876543210');
        });
        it('should throw USER_NOT_FOUND when purpose is SIGNIN and user is not registered', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue(null);
            await expect(service.resendOtp({
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
                purpose: resend_otp_dto_1.OtpPurpose.SIGNIN,
            })).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw ACCOUNT_BLOCKED when purpose is SIGNIN and user is blocked', async () => {
            mockUsersService.findByMobileAndType.mockResolvedValue({
                id: '1',
                userId: 'USR100001',
                status: client_1.UserStatus.BLOCKED,
            });
            await expect(service.resendOtp({
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
                purpose: resend_otp_dto_1.OtpPurpose.SIGNIN,
            })).rejects.toThrow(custom_exception_1.CustomException);
        });
    });
    describe('refreshToken', () => {
        it('should throw REFRESH_TOKEN_EXPIRED when token expired', async () => {
            const err = new Error('jwt expired');
            err.name = 'TokenExpiredError';
            mockJwtService.verify.mockImplementation(() => {
                throw err;
            });
            await expect(service.refreshToken({ refreshToken: 'expired_token' })).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw INVALID_REFRESH_TOKEN when token signature is invalid', async () => {
            mockJwtService.verify.mockImplementation(() => {
                throw new Error('invalid signature');
            });
            await expect(service.refreshToken({ refreshToken: 'bad_token' })).rejects.toThrow(custom_exception_1.CustomException);
        });
        it('should throw INVALID_REFRESH_TOKEN when token was revoked in Redis', async () => {
            mockJwtService.verify.mockReturnValue({
                sub: 'USR100001',
                jti: 'jti-123',
                tokenType: 'refresh',
            });
            mockRedisService.get.mockResolvedValue(null);
            await expect(service.refreshToken({ refreshToken: 'revoked_token' })).rejects.toThrow(custom_exception_1.CustomException);
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
                status: client_1.UserStatus.BLOCKED,
            });
            await expect(service.refreshToken({ refreshToken: 'valid_token' })).rejects.toThrow(custom_exception_1.CustomException);
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
                type: client_1.UserType.USER,
                mobileNumber: '9876543210',
                status: client_1.UserStatus.ACTIVE,
            });
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
//# sourceMappingURL=auth.service.spec.js.map