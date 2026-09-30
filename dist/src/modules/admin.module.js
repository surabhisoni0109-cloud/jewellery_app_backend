"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_service_1 = require("../services/admin.service");
const admin_jwt_strategy_1 = require("../common/strategies/admin-jwt.strategy");
const admin_jwt_guard_1 = require("../common/guards/admin-jwt.guard");
const prisma_module_1 = require("./prisma.module");
const s3_service_1 = require("../services/s3.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_ADMIN_SECRET', 'admin_fallback_secret_min_32_chars_long'),
                    signOptions: {
                        expiresIn: configService.get('JWT_ADMIN_EXPIRES_IN', '7d'),
                    },
                }),
            }),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, admin_jwt_strategy_1.AdminJwtStrategy, admin_jwt_guard_1.AdminJwtGuard, s3_service_1.S3Service],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map