import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class UserOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
