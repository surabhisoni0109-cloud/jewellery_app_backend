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
exports.SignupVerifyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const indian_mobile_validator_1 = require("../common/validators/indian-mobile.validator");
class SignupVerifyDto {
}
exports.SignupVerifyDto = SignupVerifyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '9876543210',
        description: '10-digit Indian mobile number registered during signup',
        required: true,
    }),
    (0, indian_mobile_validator_1.IsIndianMobile)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    __metadata("design:type", String)
], SignupVerifyDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123456',
        description: '6-digit OTP code received via SMS',
        required: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6, { message: 'otp must be exactly 6 numeric digits' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    __metadata("design:type", String)
], SignupVerifyDto.prototype, "otp", void 0);
//# sourceMappingURL=signup-verify.dto.js.map