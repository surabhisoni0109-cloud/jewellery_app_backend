import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    
    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    };

    // Support TLS if URL starts with rediss://
    if (redisUrl.startsWith('rediss://')) {
      options.tls = {
        rejectUnauthorized: false,
      };
    }

    try {
      this.client = new Redis(redisUrl, options);

      this.client.on('error', (err) => {
        this.logger.error(`Redis client error: ${err.message}`);
      });

      // Verification ping
      const pingResult = await this.client.ping();
      if (pingResult !== 'PONG') {
        throw new Error(`Unexpected ping response: ${pingResult}`);
      }

      this.logger.log('Successfully connected to Redis');
    } catch (error) {
      this.logger.error(
        `[FATAL] Failed to connect to Redis at ${redisUrl}: ${(error as Error).message}`,
      );
      process.exit(1);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Key operations helpers
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<number> {
    return this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
}
