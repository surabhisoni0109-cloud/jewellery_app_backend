import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const env = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('PORT', 3000);
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', false);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors();

  // Helmet Security Middleware with custom CSP for Swagger UI route
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/docs')) {
      // Relaxed CSP for Swagger UI documentation page
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          },
        },
      })(req, res, next);
    } else {
      // Strict helmet defaults for all standard API endpoints
      helmet()(req, res, next);
    }
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    }),
  );

  // Global Response Transformer & Exception Filter
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger Documentation Setup
  const isSwaggerAllowed = env !== 'production' || swaggerEnabled;
  if (isSwaggerAllowed) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Jewellery Marketplace Auth API')
      .setDescription(
        'Authentication & Identity Backend Service for Buyers (USER) and Sellers (VENDOR).',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token issued upon OTP verification',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // Serve raw OpenAPI JSON at /api/docs-json
    app.getHttpAdapter().get('/api/docs-json', (_req: any, res: any) => {
      res.json(document);
    });

    // Serve Swagger UI at /api/docs
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`Swagger UI documentation available at http://localhost:${port}/api/docs`);
    logger.log(`Swagger OpenAPI raw JSON available at http://localhost:${port}/api/docs-json`);
  } else {
    logger.log('Swagger documentation is disabled in production mode');
  }

  await app.listen(port);
  logger.log(`Application started and listening on port ${port} (Environment: ${env})`);
}

bootstrap();
