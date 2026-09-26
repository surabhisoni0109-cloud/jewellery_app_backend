"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const users_service_1 = require("../../services/users.service");
const custom_exception_1 = require("../exceptions/custom-exception");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'fallback_secret_min_32_characters_long'),
        });
        this.configService = configService;
        this.usersService = usersService;
    }
    async validate(payload) {
        if (!payload || !payload.sub) {
            throw new custom_exception_1.CustomException('Invalid or malformed JWT token', 'UNAUTHORIZED', common_1.HttpStatus.UNAUTHORIZED);
        }
        const user = await this.usersService.findByUserId(payload.sub);
        if (!user) {
            throw new custom_exception_1.CustomException('User account associated with token does not exist', 'UNAUTHORIZED', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (user.status === 'BLOCKED') {
            throw new custom_exception_1.CustomException('Account has been blocked. Please contact support.', 'ACCOUNT_BLOCKED', common_1.HttpStatus.FORBIDDEN);
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map