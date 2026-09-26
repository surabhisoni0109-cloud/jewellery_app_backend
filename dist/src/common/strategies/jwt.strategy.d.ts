import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../services/users.service';
import { User, UserType } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    type: UserType;
    mobileNumber: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<User>;
}
export {};
