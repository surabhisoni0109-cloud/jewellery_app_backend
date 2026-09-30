import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../services/prisma.service';
import { Admin } from '@prisma/client';
export interface AdminJwtPayload {
    sub: string;
    email: string;
    type: 'admin';
}
declare const AdminJwtStrategy_base: new (...args: any[]) => Strategy;
export declare class AdminJwtStrategy extends AdminJwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: AdminJwtPayload): Promise<Admin>;
}
export {};
