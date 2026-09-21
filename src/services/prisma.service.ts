import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      // Perform ping test to verify database connectivity
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Successfully connected to PostgreSQL (jewellery_db)');
    } catch (error) {
      this.logger.error(
        `[FATAL] Failed to connect to PostgreSQL database: ${(error as Error).message}`,
      );
      process.exit(1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
