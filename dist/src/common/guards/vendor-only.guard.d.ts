import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class VendorOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
