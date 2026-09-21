import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMS_PROVIDER_TOKEN } from '../services/sms/sms-provider.interface';
import { ConsoleSmsProvider } from '../services/sms/console-sms.provider';
import { Msg91SmsProvider } from '../services/sms/msg91-sms.provider';
import { TwilioSmsProvider } from '../services/sms/twilio-sms.provider';

@Module({
  providers: [
    ConsoleSmsProvider,
    Msg91SmsProvider,
    TwilioSmsProvider,
    {
      provide: SMS_PROVIDER_TOKEN,
      useFactory: (
        configService: ConfigService,
        consoleProvider: ConsoleSmsProvider,
        msg91Provider: Msg91SmsProvider,
        twilioProvider: TwilioSmsProvider,
      ) => {
        const providerName = configService.get<string>('SMS_PROVIDER', 'console').toLowerCase();

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
      inject: [ConfigService, ConsoleSmsProvider, Msg91SmsProvider, TwilioSmsProvider],
    },
  ],
  exports: [SMS_PROVIDER_TOKEN],
})
export class SmsModule {}
