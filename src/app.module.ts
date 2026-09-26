import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './common/config/env.validation';
import { PrismaModule } from './modules/prisma.module';
import { RedisModule } from './modules/redis.module';
import { SmsModule } from './modules/sms.module';
import { OtpModule } from './modules/otp.module';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import { VendorOnboardingModule } from './modules/vendor-onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    RedisModule,
    SmsModule,
    OtpModule,
    UsersModule,
    AuthModule,
    VendorOnboardingModule,
  ],
})
export class AppModule {}
