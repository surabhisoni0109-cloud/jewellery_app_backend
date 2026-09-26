"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOnlyGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const custom_exception_1 = require("../exceptions/custom-exception");
let VendorOnlyGuard = class VendorOnlyGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new custom_exception_1.CustomException('Missing or invalid Bearer authentication token', 'UNAUTHORIZED', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (user.type !== client_1.UserType.VENDOR) {
            throw new custom_exception_1.CustomException('This endpoint is restricted to vendor accounts only', 'VENDOR_ONLY', common_1.HttpStatus.FORBIDDEN);
        }
        return true;
    }
};
exports.VendorOnlyGuard = VendorOnlyGuard;
exports.VendorOnlyGuard = VendorOnlyGuard = __decorate([
    (0, common_1.Injectable)()
], VendorOnlyGuard);
//# sourceMappingURL=vendor-only.guard.js.map