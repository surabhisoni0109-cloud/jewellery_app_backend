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
var TwilioSmsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TwilioSmsProvider = TwilioSmsProvider_1 = class TwilioSmsProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TwilioSmsProvider_1.name);
    }
    async sendOtp(mobileNumber, _otp) {
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');
        this.logger.log(`[Twilio SMS Provider Stub] Dispatching OTP to ${mobileNumber}. AccountSid configured: ${!!accountSid}, AuthToken configured: ${!!authToken}, From: ${fromNumber}`);
    }
};
exports.TwilioSmsProvider = TwilioSmsProvider;
exports.TwilioSmsProvider = TwilioSmsProvider = TwilioSmsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioSmsProvider);
//# sourceMappingURL=twilio-sms.provider.js.map