export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare enum SmsProviderType {
    Console = "console",
    Msg91 = "msg91",
    Twilio = "twilio"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    OTP_HMAC_SECRET: string;
    OTP_TTL_SECONDS: number;
    OTP_MAX_ATTEMPTS: number;
    OTP_RESEND_COOLDOWN_SECONDS: number;
    OTP_HOURLY_LIMIT: number;
    SMS_PROVIDER: SmsProviderType;
    EXPOSE_OTP_IN_RESPONSE: boolean;
    SWAGGER_ENABLED: boolean;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_S3_BUCKET_NAME: string;
    FIREBASE_PROJECT_ID?: string;
    FIREBASE_CLIENT_EMAIL?: string;
    FIREBASE_PRIVATE_KEY?: string;
    FIREBASE_SERVICE_ACCOUNT_PATH?: string;
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
