import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../exceptions/custom-exception';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof CustomException) {
      status = exception.getStatus();
      const res = exception.getResponse() as Record<string, any>;
      message = res.message || exception.message;
      errorCode = exception.errorCode;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'object' && res !== null) {
        if (Array.isArray(res.message)) {
          message = res.message.join('; ');
          const msgStr = res.message.join(' ');
          if (msgStr.includes('mobileNumber') || msgStr.includes('Indian mobile')) {
            errorCode = 'INVALID_MOBILE';
          } else if (msgStr.includes('type must be one of')) {
            errorCode = 'INVALID_TYPE';
          } else {
            errorCode = 'BAD_REQUEST';
          }
        } else {
          message = res.message || exception.message;
          errorCode = status === HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : 'BAD_REQUEST';
        }
      } else {
        message = String(res);
        errorCode = status === HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : 'BAD_REQUEST';
      }
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    ) {
      const prismaErr = exception as Prisma.PrismaClientKnownRequestError;
      if (prismaErr.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const target = prismaErr.meta?.target as string[] | string | undefined;
        const targetStr = Array.isArray(target) ? target.join(',') : String(target || '');

        if (targetStr.includes('email')) {
          errorCode = 'EMAIL_ALREADY_EXISTS';
          message = 'An account with this email already exists for the specified type';
        } else if (targetStr.includes('mobileNumber')) {
          errorCode = 'MOBILE_ALREADY_EXISTS';
          message = 'An account with this mobile number already exists for the specified type';
        } else {
          errorCode = 'CONFLICT';
          message = 'Unique constraint violation on record';
        }
      }
    } else if (exception instanceof Error) {
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
}
