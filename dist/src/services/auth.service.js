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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("./users.service");
const otp_service_1 = require("./otp.service");
const custom_exception_1 = require("../common/exceptions/custom-exception");
let AuthService = class AuthService {
    constructor(usersService, otpService, jwtService) {
        this.usersService = usersService;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }
    async signup(dto) {
        const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
        const normalizedEmail = this.usersService.normalizeEmail(dto.email);
        const existingMobile = await this.usersService.findByMobileAndType(trimmedMobile, dto.type);
        if (existingMobile) {
            throw new custom_exception_1.CustomException('An account with this mobile number already exists for the specified type', 'MOBILE_ALREADY_EXISTS', common_1.HttpStatus.CONFLICT);
        }
        const existingEmail = await this.usersService.findByEmailAndType(normalizedEmail, dto.type);
        if (existingEmail) {
            throw new custom_exception_1.CustomException('An account with this email address already exists for the specified type', 'EMAIL_ALREADY_EXISTS', common_1.HttpStatus.CONFLICT);
        }
        const cleanPayload = {
            type: dto.type,
            firstName: this.usersService.trimInput(dto.firstName),
            lastName: this.usersService.trimInput(dto.lastName),
            mobileNumber: trimmedMobile,
            email: normalizedEmail,
        };
        return this.otpService.sendSignupOtp(trimmedMobile, cleanPayload);
    }
    async verifySignupOtp(dto) {
        const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
        const purposeKey = `signup:${trimmedMobile}`;
        const storedData = await this.otpService.verifyOtpAndRetrieveData(purposeKey, dto.otp);
        const payload = storedData.payload;
        const user = await this.createAccountAfterVerification({
            type: payload.type,
            firstName: payload.firstName,
            lastName: payload.lastName,
            mobileNumber: payload.mobileNumber,
            email: payload.email,
        });
        return this.issueSessionAfterVerification(user);
    }
    async signin(dto) {
        const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
        const user = await this.usersService.findByMobileAndType(trimmedMobile, dto.type);
        if (!user) {
            throw new custom_exception_1.CustomException(`No registered ${dto.type.toLowerCase()} account found with mobile number ${trimmedMobile}`, 'USER_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.status === 'BLOCKED') {
            throw new custom_exception_1.CustomException('Account has been blocked. Please contact support.', 'ACCOUNT_BLOCKED', common_1.HttpStatus.FORBIDDEN);
        }
        return this.otpService.sendSigninOtp(dto.type, trimmedMobile, user.userId);
    }
    async verifySigninOtp(dto) {
        const trimmedMobile = this.usersService.trimInput(dto.mobileNumber);
        const purposeKey = `signin:${dto.type}:${trimmedMobile}`;
        const storedData = await this.otpService.verifyOtpAndRetrieveData(purposeKey, dto.otp);
        const user = await this.usersService.findByUserId(storedData.userId);
        if (!user) {
            throw new custom_exception_1.CustomException('User account no longer exists', 'USER_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
        }
        if (user.status === 'BLOCKED') {
            throw new custom_exception_1.CustomException('Account has been blocked. Please contact support.', 'ACCOUNT_BLOCKED', common_1.HttpStatus.FORBIDDEN);
        }
        return this.issueSessionAfterVerification(user);
    }
    async createAccountAfterVerification(data) {
        return this.usersService.createUser(data);
    }
    async issueSessionAfterVerification(user) {
        const payload = {
            sub: user.userId,
            type: user.type,
            mobileNumber: user.mobileNumber,
        };
        const token = this.jwtService.sign(payload);
        return {
            userId: user.userId,
            type: user.type.toLowerCase(),
            firstName: user.firstName,
            lastName: user.lastName,
            mobileNumber: user.mobileNumber,
            email: user.email,
            token,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        otp_service_1.OtpService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map