"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const path = require("path");
const fs = require("fs");
const express = require('express');
const app_module_1 = require("./app.module");
const transform_response_interceptor_1 = require("./common/interceptors/transform-response.interceptor");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    const env = configService.get('NODE_ENV', 'development');
    const port = configService.get('PORT', 3000);
    const appUrl = configService.get('APP_URL', `http://localhost:${port}`);
    const swaggerEnabled = configService.get('SWAGGER_ENABLED', false);
    app.setGlobalPrefix('api');
    app.enableCors();
    const hsts = env === 'production' ? undefined : false;
    app.use((req, res, next) => {
        if (req.path.startsWith('/api/docs') || req.path.startsWith('/admin')) {
            (0, helmet_1.default)({
                hsts,
                contentSecurityPolicy: false,
            })(req, res, next);
        }
        else {
            (0, helmet_1.default)({
                hsts,
                contentSecurityPolicy: {
                    useDefaults: false,
                    directives: helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
                },
            })(req, res, next);
        }
    });
    const adminStaticDir = path.join(process.cwd(), 'public', 'admin');
    if (fs.existsSync(adminStaticDir)) {
        app.use('/admin', express.static(adminStaticDir, {
            extensions: ['html'],
        }));
        app.use('/admin', (req, res, next) => {
            if (path.extname(req.path)) {
                return next();
            }
            const potentialHtml = path.join(adminStaticDir, `${req.path.replace(/^\//, '')}.html`);
            if (fs.existsSync(potentialHtml)) {
                return res.sendFile(potentialHtml);
            }
            res.sendFile(path.join(adminStaticDir, 'index.html'));
        });
        logger.log(`Admin Portal available at ${appUrl}/admin`);
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: false,
    }));
    app.useGlobalInterceptors(new transform_response_interceptor_1.TransformResponseInterceptor());
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const isSwaggerAllowed = env !== 'production' || swaggerEnabled;
    if (isSwaggerAllowed) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Jewellery Marketplace Auth API')
            .setDescription('Authentication & Identity Backend Service for Buyers (USER) and Sellers (VENDOR).')
            .setVersion('1.0.0')
            .addServer(appUrl, env === 'production' ? 'Production' : 'Local')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Enter JWT access token issued upon OTP verification',
        }, 'bearer')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        app.getHttpAdapter().get('/api/docs-json', (_req, res) => {
            res.json(document);
        });
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        logger.log(`Swagger UI documentation available at ${appUrl}/api/docs`);
        logger.log(`Swagger OpenAPI raw JSON available at ${appUrl}/api/docs-json`);
    }
    else {
        logger.log('Swagger documentation is disabled in production mode');
    }
    await app.listen(port);
    logger.log(`Application started on port ${port} (Environment: ${env})`);
    logger.log(`API base URL: ${appUrl}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map