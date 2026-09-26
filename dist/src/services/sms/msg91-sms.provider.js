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
var Msg91SmsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Msg91SmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let Msg91SmsProvider = Msg91SmsProvider_1 = class Msg91SmsProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(Msg91SmsProvider_1.name);
    }
    async sendOtp(mobileNumber, _otp) {
        const authKey = this.configService.get('MSG91_AUTH_KEY');
        const templateId = this.configService.get('MSG91_TEMPLATE_ID');
        this.logger.log(`[MSG91 SMS Provider Stub] Dispatching OTP to ${mobileNumber}. AuthKey configured: ${!!authKey}, TemplateId configured: ${!!templateId}`);
    }
};
exports.Msg91SmsProvider = Msg91SmsProvider;
exports.Msg91SmsProvider = Msg91SmsProvider = Msg91SmsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], Msg91SmsProvider);
//# sourceMappingURL=msg91-sms.provider.js.map