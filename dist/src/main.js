"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
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
        if (req.path.startsWith('/api/docs')) {
            (0, helmet_1.default)({
                hsts,
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
                    },
                },
            })(req, res, next);
        }
        else {
            (0, helmet_1.default)({ hsts })(req, res, next);
        }
    });
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