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
var ConsoleSmsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleSmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ConsoleSmsProvider = ConsoleSmsProvider_1 = class ConsoleSmsProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ConsoleSmsProvider_1.name);
    }
    async sendOtp(mobileNumber, otp) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        if (isProduction) {
            this.logger.log(`[SMS Sent] Dispatching OTP SMS to mobile: ${mobileNumber}`);
        }
        else {
            this.logger.log(`[CONSOLE SMS PROVIDER] OTP for ${mobileNumber} is: ${otp}`);
        }
    }
};
exports.ConsoleSmsProvider = ConsoleSmsProvider;
exports.ConsoleSmsProvider = ConsoleSmsProvider = ConsoleSmsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ConsoleSmsProvider);
//# sourceMappingURL=console-sms.provider.js.map