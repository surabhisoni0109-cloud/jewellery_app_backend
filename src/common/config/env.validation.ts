import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum SmsProviderType {
  Console = 'console',
  Msg91 = 'msg91',
  Twilio = 'twilio',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_URL!: string;

  @IsString()
  @MinLength(16, { message: 'JWT_SECRET must be at least 16 characters long' })
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  @IsString()
  @MinLength(16, { message: 'OTP_HMAC_SECRET must be at least 16 characters long' })
  OTP_HMAC_SECRET!: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  OTP_TTL_SECONDS: number = 300;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  OTP_MAX_ATTEMPTS: number = 5;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  OTP_RESEND_COOLDOWN_SECONDS: number = 30;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  OTP_HOURLY_LIMIT: number = 5;

  @IsEnum(SmsProviderType)
  @IsOptional()
  SMS_PROVIDER: SmsProviderType = SmsProviderType.Console;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  EXPOSE_OTP_IN_RESPONSE: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  SWAGGER_ENABLED: boolean = false;

  // AWS S3
  @IsString()
  @IsOptional()
  AWS_REGION: string = 'ap-south-1';

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID: string = '';

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY: string = '';

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET_NAME: string = '';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`)
      .join('; ');
    throw new Error(`[Config Validation Failed] ${formattedErrors}`);
  }

  // Security Rule Enforcement:
  // Fail application startup if NODE_ENV=production and EXPOSE_OTP_IN_RESPONSE=true
  if (
    validatedConfig.NODE_ENV === Environment.Production &&
    validatedConfig.EXPOSE_OTP_IN_RESPONSE
  ) {
    throw new Error(
      'SECURITY RISK: EXPOSE_OTP_IN_RESPONSE cannot be true when NODE_ENV=production',
    );
  }

  // Fail application startup if NODE_ENV=production and SMS_PROVIDER=console
  if (
    validatedConfig.NODE_ENV === Environment.Production &&
    validatedConfig.SMS_PROVIDER === SmsProviderType.Console
  ) {
    throw new Error(
      'SECURITY RISK: SMS_PROVIDER cannot be console when NODE_ENV=production',
    );
  }

  return validatedConfig;
}
