import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../services/users.service';
import { CustomException } from '../exceptions/custom-exception';
import { User, UserType } from '@prisma/client';

export interface JwtPayload {
  sub: string; // userId e.g. USR100001
  type: UserType;
  mobileNumber: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'fallback_secret_min_32_characters_long'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    if (!payload || !payload.sub) {
      throw new CustomException('Invalid or malformed JWT token', 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.usersService.findByUserId(payload.sub);

    if (!user) {
      throw new CustomException('User account associated with token does not exist', 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }

    if (user.status === 'BLOCKED') {
      throw new CustomException('Account has been blocked. Please contact support.', 'ACCOUNT_BLOCKED', HttpStatus.FORBIDDEN);
    }

    return user;
  }
}
