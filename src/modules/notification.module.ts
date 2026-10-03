import { Module } from '@nestjs/common';
import { FirebaseService } from '../services/firebase.service';
import { NotificationService } from '../services/notification.service';
import { NotificationController } from '../controllers/notification.controller';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [NotificationController],
  providers: [FirebaseService, NotificationService],
  exports: [FirebaseService, NotificationService],
})
export class NotificationModule {}
