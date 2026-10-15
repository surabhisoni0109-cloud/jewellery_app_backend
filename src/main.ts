import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as path from 'path';
import * as fs from 'fs';
const express = require('express');
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const env = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('PORT', 3000);
  const appUrl = configService.get<string>('APP_URL', `http://localhost:${port}`);
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', false);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // CORS Configuration
  app.enableCors();

  // Disable HSTS on non-production to avoid browser forcing HTTPS without SSL cert
  const hsts = env === 'production' ? undefined : false;

  // Relax Helmet CSP for Swagger UI and Admin Portal
  app.use((req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/docs') || req.path.startsWith('/admin')) {
      helmet({
        hsts,
        contentSecurityPolicy: false,
      })(req, res, next);
    } else {
      helmet({
        hsts,
        contentSecurityPolicy: {
          useDefaults: false,
          directives: helmet.contentSecurityPolicy.getDefaultDirectives(),
        },
      })(req, res, next);
    }
  });

  // Serve uploaded files from public/uploads at /uploads
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Serve Next.js Admin Portal static export from public/admin at /admin
  const adminStaticDir = path.join(process.cwd(), 'public', 'admin');
  if (fs.existsSync(adminStaticDir)) {
    // Intercept and resolve Next.js App Router RSC prefetch requests
    // e.g. /users/__next.!KHBhZ2VzKQ.users.__PAGE__.txt -> /users/__next.!KHBhZ2VzKQ/users/__PAGE__.txt
    app.use('/admin', (req: any, res: any, next: any) => {
      if (req.path.includes('__next.') && req.path.endsWith('.txt')) {
        const cleanPath = req.path.replace(/^\//, '');
        const directFile = path.join(adminStaticDir, cleanPath);
        if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          return res.sendFile(directFile);
        }

        const parts = cleanPath.split('/');
        const fileName = parts.pop();
        if (fileName && fileName.endsWith('.__PAGE__.txt')) {
          const baseName = fileName.replace('.__PAGE__.txt', '');
          if (baseName.startsWith('__next.')) {
            const remainder = baseName.slice('__next.'.length);
            const segments = remainder.split('.');
            const candidatePath = path.join(
              adminStaticDir,
              ...parts,
              `__next.${segments[0]}`,
              ...segments.slice(1),
              '__PAGE__.txt',
            );
            if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              return res.sendFile(candidatePath);
            }
          }
        }
      }
      next();
    });

    app.use(
      '/admin',
      express.static(adminStaticDir, {
        extensions: ['html'],
      }),
    );
    app.use('/admin', (req: any, res: any, next: any) => {
      if (path.extname(req.path)) {
        return next();
      }
      const cleanPath = req.path.replace(/^\//, '').replace(/\/+$/, '');
      if (cleanPath) {
        const potentialHtml = path.join(adminStaticDir, `${cleanPath}.html`);
        if (fs.existsSync(potentialHtml) && fs.statSync(potentialHtml).isFile()) {
          return res.sendFile(potentialHtml);
        }
        const potentialIndexHtml = path.join(adminStaticDir, cleanPath, 'index.html');
        if (fs.existsSync(potentialIndexHtml) && fs.statSync(potentialIndexHtml).isFile()) {
          return res.sendFile(potentialIndexHtml);
        }
      }
      res.sendFile(path.join(adminStaticDir, 'index.html'));
    });
    logger.log(`Admin Portal available at ${appUrl}/admin`);
  }


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
      .addServer(appUrl, env === 'production' ? 'Production' : 'Local')
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

    logger.log(`Swagger UI documentation available at ${appUrl}/api/docs`);
    logger.log(`Swagger OpenAPI raw JSON available at ${appUrl}/api/docs-json`);
  } else {
    logger.log('Swagger documentation is disabled in production mode');
  }

  await app.listen(port);
  logger.log(`Application started on port ${port} (Environment: ${env})`);
  logger.log(`API base URL: ${appUrl}/api`);
}

bootstrap();


