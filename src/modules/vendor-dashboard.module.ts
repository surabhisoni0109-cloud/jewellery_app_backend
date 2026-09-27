import { Module } from '@nestjs/common';
import { VendorDashboardController } from '../controllers/vendor-dashboard.controller';
import { VendorDashboardService } from '../services/vendor-dashboard.service';

@Module({
  controllers: [VendorDashboardController],
  providers: [VendorDashboardService],
  exports: [VendorDashboardService],
})
export class VendorDashboardModule {}
