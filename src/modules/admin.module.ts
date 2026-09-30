import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/admin.service';
import { AdminJwtStrategy } from '../common/strategies/admin-jwt.strategy';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { PrismaModule } from './prisma.module';
import { S3Service } from '../services/s3.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_ADMIN_SECRET',
          'admin_fallback_secret_min_32_chars_long',
        ),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ADMIN_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtStrategy, AdminJwtGuard, S3Service],
  exports: [AdminService],
})
export class AdminModule {}
