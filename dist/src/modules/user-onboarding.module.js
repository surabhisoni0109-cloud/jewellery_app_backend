"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const user_onboarding_controller_1 = require("../controllers/user-onboarding.controller");
const user_onboarding_service_1 = require("../services/user-onboarding.service");
const s3_service_1 = require("../services/s3.service");
const prisma_module_1 = require("./prisma.module");
const auth_module_1 = require("./auth.module");
let UserOnboardingModule = class UserOnboardingModule {
};
exports.UserOnboardingModule = UserOnboardingModule;
exports.UserOnboardingModule = UserOnboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [user_onboarding_controller_1.UserOnboardingController],
        providers: [user_onboarding_service_1.UserOnboardingService, s3_service_1.S3Service],
        exports: [user_onboarding_service_1.UserOnboardingService, s3_service_1.S3Service],
    })
], UserOnboardingModule);
//# sourceMappingURL=user-onboarding.module.js.map