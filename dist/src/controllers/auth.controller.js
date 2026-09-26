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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../services/auth.service");
const signup_dto_1 = require("../dto/signup.dto");
const signup_verify_dto_1 = require("../dto/signup-verify.dto");
const signin_dto_1 = require("../dto/signin.dto");
const signin_verify_dto_1 = require("../dto/signin-verify.dto");
const auth_response_dto_1 = require("../dto/auth-response.dto");
const api_response_wrapper_decorator_1 = require("../common/decorators/api-response-wrapper.decorator");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async signup(signupDto) {
        const result = await this.authService.signup(signupDto);
        return {
            message: 'OTP sent successfully',
            data: result,
        };
    }
    async verifySignupOtp(signupVerifyDto) {
        const session = await this.authService.verifySignupOtp(signupVerifyDto);
        return {
            message: 'Registration completed successfully',
            data: session,
        };
    }
    async signin(signinDto) {
        const result = await this.authService.signin(signinDto);
        return {
            message: 'OTP sent successfully',
            data: result,
        };
    }
    async verifySigninOtp(signinVerifyDto) {
        const session = await this.authService.verifySigninOtp(signinVerifyDto);
        return {
            message: 'Signin successful',
            data: session,
        };
    }
    async getMe(user) {
        return {
            message: 'Profile fetched successfully',
            data: user,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Request Signup OTP',
        description: 'Validates signup details, checks for existing user duplicates, stores pending payload in Redis and dispatches OTP SMS.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(auth_response_dto_1.OtpResponseDto, 200, 'OTP sent successfully'),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation failed (INVALID_TYPE or INVALID_MOBILE)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already exists (MOBILE_ALREADY_EXISTS or EMAIL_ALREADY_EXISTS)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Rate limit or resend cooldown exceeded (OTP_LIMIT_EXCEEDED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('signup/verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify Signup OTP & Create Account',
        description: 'Verifies the pending signup OTP, creates the user account in PostgreSQL, and returns a JWT access token.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(auth_response_dto_1.AuthSessionResponseDto, 201, 'Signup successful'),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid or expired OTP (INVALID_OTP or OTP_EXPIRED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_verify_dto_1.SignupVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySignupOtp", null);
__decorate([
    (0, common_1.Post)('signin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Request Signin OTP',
        description: 'Validates registered user mobile and type, verifies active account status, and dispatches signin OTP SMS.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(auth_response_dto_1.OtpResponseDto, 200, 'OTP sent successfully'),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Validation failed (INVALID_TYPE or INVALID_MOBILE)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Account is blocked (ACCOUNT_BLOCKED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not registered (USER_NOT_FOUND)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Rate limit or resend cooldown exceeded (OTP_LIMIT_EXCEEDED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SigninDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.Post)('signin/verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify Signin OTP & Authenticate',
        description: 'Verifies the signin OTP, validates user status, and issues a JWT access token.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(auth_response_dto_1.AuthSessionResponseDto, 200, 'Signin successful'),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid or expired OTP (INVALID_OTP or OTP_EXPIRED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Account is blocked (ACCOUNT_BLOCKED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'User not found (USER_NOT_FOUND)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_verify_dto_1.SigninVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySigninOtp", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Current Authenticated Account',
        description: 'Returns the profile of the currently logged-in user or vendor.',
    }),
    (0, api_response_wrapper_decorator_1.ApiWrappedResponse)(auth_response_dto_1.UserResponseDto, 200, 'Profile fetched successfully'),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Missing, invalid, or expired JWT bearer token (UNAUTHORIZED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Account has been blocked (ACCOUNT_BLOCKED)',
        type: api_response_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map