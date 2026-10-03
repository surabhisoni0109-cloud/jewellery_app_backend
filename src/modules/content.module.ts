import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { ContentService } from '../services/content.service';
import { ContactService } from '../services/contact.service';
import { ContentController } from '../controllers/content.controller';
import { ContactController } from '../controllers/contact.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContentController, ContactController],
  providers: [ContentService, ContactService],
  exports: [ContentService, ContactService],
})
export class ContentModule {}
