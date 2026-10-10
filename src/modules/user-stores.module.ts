import { Module } from '@nestjs/common';
import { UserStoresController } from '../controllers/user-stores.controller';
import { UserStoresService } from '../services/user-stores.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserStoresController],
  providers: [UserStoresService],
  exports: [UserStoresService],
})
export class UserStoresModule {}
