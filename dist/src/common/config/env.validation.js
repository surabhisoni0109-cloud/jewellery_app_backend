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
exports.SmsProviderType = exports.Environment = void 0;
exports.validate = validate;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var Environment;
(function (Environment) {
    Environment["Development"] = "development";
    Environment["Production"] = "production";
    Environment["Test"] = "test";
})(Environment || (exports.Environment = Environment = {}));
var SmsProviderType;
(function (SmsProviderType) {
    SmsProviderType["Console"] = "console";
    SmsProviderType["Msg91"] = "msg91";
    SmsProviderType["Twilio"] = "twilio";
})(SmsProviderType || (exports.SmsProviderType = SmsProviderType = {}));
class EnvironmentVariables {
    constructor() {
        this.NODE_ENV = Environment.Development;
        this.PORT = 3000;
        this.JWT_EXPIRES_IN = '1d';
        this.JWT_ACCESS_EXPIRES_IN = '1d';
        this.JWT_REFRESH_SECRET = '';
        this.JWT_REFRESH_EXPIRES_IN = '7d';
        this.OTP_TTL_SECONDS = 300;
        this.OTP_MAX_ATTEMPTS = 5;
        this.OTP_RESEND_COOLDOWN_SECONDS = 30;
        this.OTP_HOURLY_LIMIT = 5;
        this.SMS_PROVIDER = SmsProviderType.Console;
        this.EXPOSE_OTP_IN_RESPONSE = false;
        this.SWAGGER_ENABLED = false;
        this.AWS_REGION = 'ap-south-1';
        this.AWS_ACCESS_KEY_ID = '';
        this.AWS_SECRET_ACCESS_KEY = '';
        this.AWS_S3_BUCKET_NAME = '';
    }
}
__decorate([
    (0, class_validator_1.IsEnum)(Environment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DATABASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_URL", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16, { message: 'JWT_SECRET must be at least 16 characters long' }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_EXPIRES_IN", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_EXPIRES_IN", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_EXPIRES_IN", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16, { message: 'OTP_HMAC_SECRET must be at least 16 characters long' }),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "OTP_HMAC_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "OTP_TTL_SECONDS", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "OTP_MAX_ATTEMPTS", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "OTP_RESEND_COOLDOWN_SECONDS", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "OTP_HOURLY_LIMIT", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SmsProviderType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMS_PROVIDER", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, "EXPOSE_OTP_IN_RESPONSE", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, "SWAGGER_ENABLED", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_REGION", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_ACCESS_KEY_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_SECRET_ACCESS_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "AWS_S3_BUCKET_NAME", void 0);
function validate(config) {
    const validatedConfig = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        const formattedErrors = errors
            .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`)
            .join('; ');
        throw new Error(`[Config Validation Failed] ${formattedErrors}`);
    }
    if (validatedConfig.NODE_ENV === Environment.Production &&
        validatedConfig.EXPOSE_OTP_IN_RESPONSE) {
        throw new Error('SECURITY RISK: EXPOSE_OTP_IN_RESPONSE cannot be true when NODE_ENV=production');
    }
    if (validatedConfig.NODE_ENV === Environment.Production &&
        validatedConfig.SMS_PROVIDER === SmsProviderType.Console) {
        throw new Error('SECURITY RISK: SMS_PROVIDER cannot be console when NODE_ENV=production');
    }
    return validatedConfig;
}
//# sourceMappingURL=env.validation.js.map