import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomException } from '../exceptions/custom-exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      if (err instanceof CustomException) {
        throw err;
      }
      throw new CustomException(
        err.message || 'Unauthorized access',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user) {
      const message = info?.message
        ? `Authentication failed: ${info.message}`
        : 'Missing or invalid Bearer authentication token';
      throw new CustomException(message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
