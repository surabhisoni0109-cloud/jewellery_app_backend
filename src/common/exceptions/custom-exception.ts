import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorCode =
  | 'INVALID_TYPE'
  | 'INVALID_MOBILE'
  | 'MOBILE_ALREADY_EXISTS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'OTP_LIMIT_EXCEEDED'
  | 'ACCOUNT_BLOCKED'
  | 'UNAUTHORIZED';

export class CustomException extends HttpException {
  public readonly errorCode: ErrorCode;

  constructor(message: string, errorCode: ErrorCode, statusCode: HttpStatus) {
    super(
      {
        success: false,
        message,
        error: {
          code: errorCode,
        },
      },
      statusCode,
    );
    this.errorCode = errorCode;
  }
}
