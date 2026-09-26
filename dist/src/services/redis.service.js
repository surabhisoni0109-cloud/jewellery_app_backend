"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
    }
    async onModuleInit() {
        const redisUrl = this.configService.get('REDIS_URL', 'redis://localhost:6379');
        const options = {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3)
                    return null;
                return Math.min(times * 100, 3000);
            },
        };
        if (redisUrl.startsWith('rediss://')) {
            options.tls = {
                rejectUnauthorized: false,
            };
        }
        try {
            this.client = new ioredis_1.default(redisUrl, options);
            this.client.on('error', (err) => {
                this.logger.error(`Redis client error: ${err.message}`);
            });
            const pingResult = await this.client.ping();
            if (pingResult !== 'PONG') {
                throw new Error(`Unexpected ping response: ${pingResult}`);
            }
            this.logger.log('Successfully connected to Redis');
        }
        catch (error) {
            this.logger.error(`[FATAL] Failed to connect to Redis at ${redisUrl}: ${error.message}`);
            process.exit(1);
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }
    getClient() {
        return this.client;
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds && ttlSeconds > 0) {
            return this.client.set(key, value, 'EX', ttlSeconds);
        }
        return this.client.set(key, value);
    }
    async del(key) {
        return this.client.del(key);
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async expire(key, ttlSeconds) {
        return this.client.expire(key, ttlSeconds);
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map