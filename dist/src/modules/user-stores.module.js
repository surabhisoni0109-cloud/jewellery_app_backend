"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStoresModule = void 0;
const common_1 = require("@nestjs/common");
const user_stores_controller_1 = require("../controllers/user-stores.controller");
const user_stores_service_1 = require("../services/user-stores.service");
const prisma_module_1 = require("./prisma.module");
const auth_module_1 = require("./auth.module");
let UserStoresModule = class UserStoresModule {
};
exports.UserStoresModule = UserStoresModule;
exports.UserStoresModule = UserStoresModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [user_stores_controller_1.UserStoresController],
        providers: [user_stores_service_1.UserStoresService],
        exports: [user_stores_service_1.UserStoresService],
    })
], UserStoresModule);
//# sourceMappingURL=user-stores.module.js.map