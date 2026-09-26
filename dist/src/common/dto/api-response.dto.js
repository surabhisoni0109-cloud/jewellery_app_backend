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
exports.ApiSuccessResponseDto = exports.ApiErrorResponseDto = exports.ErrorDetailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ErrorDetailDto {
}
exports.ErrorDetailDto = ErrorDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'INVALID_OTP', description: 'Business error code from specification' }),
    __metadata("design:type", String)
], ErrorDetailDto.prototype, "code", void 0);
class ApiErrorResponseDto {
}
exports.ApiErrorResponseDto = ApiErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], ApiErrorResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Invalid OTP provided' }),
    __metadata("design:type", String)
], ApiErrorResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ErrorDetailDto }),
    __metadata("design:type", ErrorDetailDto)
], ApiErrorResponseDto.prototype, "error", void 0);
class ApiSuccessResponseDto {
}
exports.ApiSuccessResponseDto = ApiSuccessResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ApiSuccessResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Operation completed successfully' }),
    __metadata("design:type", String)
], ApiSuccessResponseDto.prototype, "message", void 0);
//# sourceMappingURL=api-response.dto.js.map