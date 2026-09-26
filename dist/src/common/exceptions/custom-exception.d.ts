import { HttpException, HttpStatus } from '@nestjs/common';
export type ErrorCode = 'INVALID_TYPE' | 'INVALID_MOBILE' | 'MOBILE_ALREADY_EXISTS' | 'EMAIL_ALREADY_EXISTS' | 'USER_NOT_FOUND' | 'INVALID_OTP' | 'OTP_EXPIRED' | 'OTP_LIMIT_EXCEEDED' | 'ACCOUNT_BLOCKED' | 'UNAUTHORIZED' | 'VENDOR_ONLY' | 'PROFILE_NOT_FOUND' | 'INVALID_IMAGE' | 'TOO_MANY_IMAGES' | 'INVALID_LOCATION' | 'INVALID_TIME_RANGE' | 'UNDERAGE' | 'INVALID_FOUNDED_YEAR' | 'SHOWCASE_ITEM_NOT_FOUND' | 'SHOWCASE_LIMIT_REACHED' | 'INVALID_ITEMS' | 'VALIDATION_ERROR';
export declare class CustomException extends HttpException {
    readonly errorCode: ErrorCode;
    constructor(message: string, errorCode: ErrorCode, statusCode: HttpStatus);
}
