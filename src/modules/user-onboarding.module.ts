import { Module } from '@nestjs/common';
import { UserOnboardingController } from '../controllers/user-onboarding.controller';
import { UserOnboardingService } from '../services/user-onboarding.service';
import { S3Service } from '../services/s3.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserOnboardingController],
  providers: [UserOnboardingService, S3Service],
  exports: [UserOnboardingService, S3Service],
})
export class UserOnboardingModule {}
