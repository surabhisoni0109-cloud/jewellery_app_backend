import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomException } from '../exceptions/custom-exception';

@Injectable()
export class AdminJwtGuard extends AuthGuard('admin-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, admin: any) {
    if (err || !admin) {
      throw new CustomException(
        'Admin authentication required',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return admin;
  }
}
