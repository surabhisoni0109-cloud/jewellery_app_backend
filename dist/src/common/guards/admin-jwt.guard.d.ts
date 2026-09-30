import { ExecutionContext } from '@nestjs/common';
declare const AdminJwtGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class AdminJwtGuard extends AdminJwtGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest(err: any, admin: any): any;
}
export {};
