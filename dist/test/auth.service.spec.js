"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const auth_service_1 = require("../src/services/auth.service");
const users_service_1 = require("../src/services/users.service");
const otp_service_1 = require("../src/services/otp.service");
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
        verifyOtpAndRetrieveData: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mocked_jwt_token_string'),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: users_service_1.UsersService, useValue: mockUsersService },
                { provide: otp_service_1.OtpService, useValue: mockOtpService },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
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
});
//# sourceMappingURL=auth.service.spec.js.map