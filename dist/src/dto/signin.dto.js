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
exports.SigninDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const indian_mobile_validator_1 = require("../common/validators/indian-mobile.validator");
class SigninDto {
}
exports.SigninDto = SigninDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.UserType,
        example: 'user',
        description: 'Account type role (user or vendor)',
        required: true,
    }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value),
    (0, class_validator_1.IsEnum)(client_1.UserType, { message: 'type must be one of the following values: user, vendor' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SigninDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '9876543210',
        description: '10-digit Indian mobile number',
        required: true,
    }),
    (0, indian_mobile_validator_1.IsIndianMobile)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    __metadata("design:type", String)
], SigninDto.prototype, "mobileNumber", void 0);
//# sourceMappingURL=signin.dto.js.map