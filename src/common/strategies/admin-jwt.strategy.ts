import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../services/prisma.service';
import { CustomException } from '../exceptions/custom-exception';
import { Admin } from '@prisma/client';

export interface AdminJwtPayload {
  sub: string; // Admin id (UUID)
  email: string;
  type: 'admin';
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ADMIN_SECRET',
        'admin_fallback_secret_min_32_chars_long',
      ),
    });
  }

  async validate(payload: AdminJwtPayload): Promise<Admin> {
    if (!payload || !payload.sub || payload.type !== 'admin') {
      throw new CustomException(
        'Invalid or malformed admin JWT token',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin) {
      throw new CustomException(
        'Admin account associated with token does not exist',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return admin;
  }
}
