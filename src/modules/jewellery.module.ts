import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { JewelleryService } from '../services/jewellery.service';
import { S3Service } from '../services/s3.service';
import { VendorJewelleryController } from '../controllers/vendor-jewellery.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VendorJewelleryController],
  providers: [JewelleryService, S3Service],
  exports: [JewelleryService],
})
export class JewelleryModule {}
