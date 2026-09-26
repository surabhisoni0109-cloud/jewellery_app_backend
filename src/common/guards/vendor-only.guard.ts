import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { CustomException } from '../exceptions/custom-exception';

/**
 * Ensures the currently authenticated user is of type VENDOR.
 * Must be applied AFTER JwtAuthGuard (which populates request.user).
 */
@Injectable()
export class VendorOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new CustomException(
        'Missing or invalid Bearer authentication token',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.type !== UserType.VENDOR) {
      throw new CustomException(
        'This endpoint is restricted to vendor accounts only',
        'VENDOR_ONLY',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
