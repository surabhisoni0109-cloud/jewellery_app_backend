"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sms_provider_interface_1 = require("../services/sms/sms-provider.interface");
const console_sms_provider_1 = require("../services/sms/console-sms.provider");
const msg91_sms_provider_1 = require("../services/sms/msg91-sms.provider");
const twilio_sms_provider_1 = require("../services/sms/twilio-sms.provider");
let SmsModule = class SmsModule {
};
exports.SmsModule = SmsModule;
exports.SmsModule = SmsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            console_sms_provider_1.ConsoleSmsProvider,
            msg91_sms_provider_1.Msg91SmsProvider,
            twilio_sms_provider_1.TwilioSmsProvider,
            {
                provide: sms_provider_interface_1.SMS_PROVIDER_TOKEN,
                useFactory: (configService, consoleProvider, msg91Provider, twilioProvider) => {
                    const providerName = configService.get('SMS_PROVIDER', 'console').toLowerCase();
                    switch (providerName) {
                        case 'msg91':
                            return msg91Provider;
                        case 'twilio':
                            return twilioProvider;
                        case 'console':
                        default:
                            return consoleProvider;
                    }
                },
                inject: [config_1.ConfigService, console_sms_provider_1.ConsoleSmsProvider, msg91_sms_provider_1.Msg91SmsProvider, twilio_sms_provider_1.TwilioSmsProvider],
            },
        ],
        exports: [sms_provider_interface_1.SMS_PROVIDER_TOKEN],
    })
], SmsModule);
//# sourceMappingURL=sms.module.js.map