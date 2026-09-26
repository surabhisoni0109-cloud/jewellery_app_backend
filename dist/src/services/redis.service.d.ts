import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private client;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<'OK'>;
    del(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    expire(key: string, ttlSeconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
}
