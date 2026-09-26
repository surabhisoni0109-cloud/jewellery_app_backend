"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const transform_response_interceptor_1 = require("../src/common/interceptors/transform-response.interceptor");
const global_exception_filter_1 = require("../src/common/filters/global-exception.filter");
const redis_service_1 = require("../src/services/redis.service");
const prisma_service_1 = require("../src/services/prisma.service");
const client_1 = require("@prisma/client");
describe('Authentication Flow (e2e)', () => {
    let app;
    let redisService;
    let prismaService;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }));
        app.useGlobalInterceptors(new transform_response_interceptor_1.TransformResponseInterceptor());
        app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
        await app.init();
        redisService = app.get(redis_service_1.RedisService);
        prismaService = app.get(prisma_service_1.PrismaService);
    });
    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
    const testMobile = '9998887771';
    const testEmail = 'e2e.test@example.com';
    beforeEach(async () => {
        const redisClient = redisService.getClient();
        await redisClient.del(`otp:signup:${testMobile}`);
        await redisClient.del(`otp:cooldown:signup:${testMobile}`);
        await redisClient.del(`otp:hourly:${testMobile}`);
        try {
            await prismaService.user.deleteMany({
                where: { mobileNumber: testMobile },
            });
        }
        catch {
        }
    });
    describe('POST /api/auth/signup', () => {
        it('should validate 10-digit Indian mobile format', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send({
                type: 'USER',
                firstName: 'Test',
                lastName: 'User',
                mobileNumber: '123',
                email: testEmail,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('INVALID_MOBILE');
        });
        it('should validate invalid UserType role', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send({
                type: 'SUPERADMIN',
                firstName: 'Test',
                lastName: 'User',
                mobileNumber: testMobile,
                email: testEmail,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('INVALID_TYPE');
        });
        it('should return devOtp when EXPOSE_OTP_IN_RESPONSE=true', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send({
                type: client_1.UserType.USER,
                firstName: 'E2E',
                lastName: 'Tester',
                mobileNumber: testMobile,
                email: testEmail,
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.mobileNumber).toBe(testMobile);
            expect(response.body.data.devOtp).toBeDefined();
        });
    });
    describe('POST /api/auth/signup/verify-otp', () => {
        it('should verify OTP, create user in DB, and return JWT session token', async () => {
            const signupRes = await request(app.getHttpServer())
                .post('/api/auth/signup')
                .send({
                type: client_1.UserType.USER,
                firstName: 'E2E',
                lastName: 'Tester',
                mobileNumber: testMobile,
                email: testEmail,
            })
                .expect(200);
            const devOtp = signupRes.body.data.devOtp;
            expect(devOtp).toBeDefined();
            const verifyRes = await request(app.getHttpServer())
                .post('/api/auth/signup/verify-otp')
                .send({
                mobileNumber: testMobile,
                otp: devOtp,
            })
                .expect(201);
            expect(verifyRes.body.success).toBe(true);
            expect(verifyRes.body.data.token).toBeDefined();
            expect(verifyRes.body.data.user.userId).toMatch(/^USR\d+$/);
            const token = verifyRes.body.data.token;
            const meRes = await request(app.getHttpServer())
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(meRes.body.success).toBe(true);
            expect(meRes.body.data.mobileNumber).toBe(testMobile);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map