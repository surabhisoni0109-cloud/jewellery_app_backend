import { Module } from '@nestjs/common';
import { VendorOnboardingController } from '../controllers/vendor-onboarding.controller';
import { VendorOnboardingService } from '../services/vendor-onboarding.service';
import { S3Service } from '../services/s3.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VendorOnboardingController],
  providers: [VendorOnboardingService, S3Service],
  exports: [VendorOnboardingService, S3Service],
})
export class VendorOnboardingModule {}
