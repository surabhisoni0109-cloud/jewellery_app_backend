import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { RedisService } from '../src/services/redis.service';
import { PrismaService } from '../src/services/prisma.service';
import { UserType } from '@prisma/client';

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();

    redisService = app.get<RedisService>(RedisService);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const testMobile = '9998887771';
  const testEmail = 'e2e.test@example.com';

  beforeEach(async () => {
    // Cleanup Redis keys & Postgres test user if present
    const redisClient = redisService.getClient();
    await redisClient.del(`otp:signup:${testMobile}`);
    await redisClient.del(`otp:cooldown:signup:${testMobile}`);
    await redisClient.del(`otp:hourly:${testMobile}`);

    try {
      await prismaService.user.deleteMany({
        where: { mobileNumber: testMobile },
      });
    } catch {
      // Ignore if DB connection is mocked in unit test env
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
          mobileNumber: '123', // Invalid format
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
          type: 'SUPERADMIN', // Invalid role
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
          type: UserType.USER,
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
      // Step 1: Request OTP
      const signupRes = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          type: UserType.USER,
          firstName: 'E2E',
          lastName: 'Tester',
          mobileNumber: testMobile,
          email: testEmail,
        })
        .expect(200);

      const devOtp = signupRes.body.data.devOtp;
      expect(devOtp).toBeDefined();

      // Step 2: Verify OTP
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

      // Step 3: Access Protected GET /api/auth/me
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
