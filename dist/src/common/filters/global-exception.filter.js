"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const custom_exception_1 = require("../exceptions/custom-exception");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorCode = 'INTERNAL_SERVER_ERROR';
        if (exception instanceof custom_exception_1.CustomException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message = res.message || exception.message;
            errorCode = exception.errorCode;
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null) {
                if (Array.isArray(res.message)) {
                    message = res.message.join('; ');
                    const msgStr = res.message.join(' ');
                    if (msgStr.includes('mobileNumber') || msgStr.includes('Indian mobile')) {
                        errorCode = 'INVALID_MOBILE';
                    }
                    else if (msgStr.includes('type must be one of')) {
                        errorCode = 'INVALID_TYPE';
                    }
                    else {
                        errorCode = 'BAD_REQUEST';
                    }
                }
                else {
                    message = res.message || exception.message;
                    errorCode = status === common_1.HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : 'BAD_REQUEST';
                }
            }
            else {
                message = String(res);
                errorCode = status === common_1.HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : 'BAD_REQUEST';
            }
        }
        else if (exception &&
            typeof exception === 'object' &&
            'code' in exception &&
            typeof exception.code === 'string' &&
            exception.code.startsWith('P')) {
            const prismaErr = exception;
            if (prismaErr.code === 'P2002') {
                status = common_1.HttpStatus.CONFLICT;
                const target = prismaErr.meta?.target;
                const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');
                if (targetStr.includes('email')) {
                    errorCode = 'EMAIL_ALREADY_EXISTS';
                    message = 'An account with this email already exists for the specified type';
                }
                else if (targetStr.includes('mobileNumber')) {
                    errorCode = 'MOBILE_ALREADY_EXISTS';
                    message = 'An account with this mobile number already exists for the specified type';
                }
                else {
                    errorCode = 'CONFLICT';
                    message = 'Unique constraint violation on record';
                }
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
        }
        response.status(status).json({
            success: false,
            message,
            error: {
                code: errorCode,
            },
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map