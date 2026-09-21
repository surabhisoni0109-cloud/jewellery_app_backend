import { Module } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { SmsModule } from './sms.module';

@Module({
  imports: [SmsModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
