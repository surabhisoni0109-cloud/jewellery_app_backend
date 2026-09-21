# Jewellery Marketplace Authentication Backend

A production-ready, highly secure authentication backend service for a jewellery marketplace supporting **Buyers (`USER`)** and **Sellers (`VENDOR`)**, built with NestJS (TypeScript strict mode), PostgreSQL, Prisma ORM, Redis (`ioredis`), JWT, and OpenAPI / Swagger documentation.

---

## Technical Stack & Architecture

- **Framework**: NestJS v10+ (TypeScript Strict Mode)
- **Database**: PostgreSQL with Prisma ORM v6
- **Cache & State**: Redis (`ioredis`) for OTP state, rate limiting, and cooldowns
- **Authentication**: JWT (`@nestjs/jwt` + Passport strategy) with reusable `JwtAuthGuard`
- **Validation**: `class-validator` + `class-transformer` with custom Indian mobile regex validator (`/^[6-9]\d{9}$/`)
- **API Documentation**: Interactive Swagger UI at `/api/docs` and OpenAPI JSON at `/api/docs-json`
- **Security**: `helmet` (with tailored CSP for Swagger UI), CORS, and `@nestjs/throttler`
- **SMS Providers**: Modular `SmsProvider` interface supporting `ConsoleSmsProvider`, `Msg91SmsProvider` (stub), and `TwilioSmsProvider` (stub)

---

## Directory Structure

```
jewellery_app_backend/
├── docs/
│   └── auth-api.md                    # Canonical API Specification
├── prisma/
│   ├── schema.prisma                  # Prisma data models & enums
│   └── seed.ts                        # Initial seed data for test accounts
├── src/
│   ├── main.ts                        # App initialization, helmet CSP, Swagger, ValidationPipe
│   ├── app.module.ts                  # Root NestJS module
│   ├── controllers/
│   │   └── auth.controller.ts         # Auth endpoints (signup, signin, verify, me)
│   ├── services/
│   │   ├── auth.service.ts            # High-level auth orchestration & JWT handling
│   │   ├── users.service.ts           # DB queries for Users & public ID generation (USR/VND)
│   │   ├── otp.service.ts             # HMAC SHA-256 OTP hashing, generation & rate limits
│   │   ├── redis.service.ts           # ioredis client (supports redis:// and rediss://)
│   │   ├── prisma.service.ts          # Database connection readiness check
│   │   └── sms/
│   │       ├── sms-provider.interface.ts # Swappable provider interface
│   │       ├── console-sms.provider.ts   # Console log SMS provider
│   │       ├── msg91-sms.provider.ts     # MSG91 stub provider
│   │       └── twilio-sms.provider.ts    # Twilio stub provider
│   ├── dto/
│   │   ├── signup.dto.ts
│   │   ├── signup-verify.dto.ts
│   │   ├── signin.dto.ts
│   │   ├── signin-verify.dto.ts
│   │   └── auth-response.dto.ts
│   ├── common/
│   │   ├── config/
│   │   │   └── env.validation.ts      # Fail-fast environment variable validation
│   │   ├── decorators/
│   │   │   ├── api-response-wrapper.decorator.ts  # Generic Swagger wrapper helper
│   │   │   └── current-user.decorator.ts          # @CurrentUser() parameter decorator
│   │   ├── dto/
│   │   │   └── api-response.dto.ts
│   │   ├── exceptions/
│   │   │   └── custom-exception.ts    # Custom Business Exception with spec error code
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts  # Formats all exceptions to spec { success, message, error }
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts      # JWT Guard with BLOCKED status check
│   │   ├── interceptors/
│   │   │   └── transform-response.interceptor.ts  # Wraps successful responses in { success, message, data }
│   │   └── validators/
│   │       └── indian-mobile.validator.ts         # Shared Indian mobile validator (/^[6-9]\d{9}$/)
│   └── modules/
│       ├── auth.module.ts
│       ├── users.module.ts
│       ├── otp.module.ts
│       ├── redis.module.ts
│       ├── prisma.module.ts
│       └── sms.module.ts
├── test/
│   ├── otp.service.spec.ts            # Unit tests for OtpService
│   ├── auth.service.spec.ts           # Unit tests for AuthService
│   └── auth.e2e-spec.ts               # E2E integration test for signup & signin flows
├── .env.example                       # Reference environment variables
├── .gitignore
├── eslint.config.mjs
├── jest.config.js
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## Environment Setup & Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables in `.env`:
   - `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/jewellery_db?schema=public`
   - `REDIS_URL`: `redis://localhost:6379` (or TLS `rediss://...`)
   - `JWT_SECRET`: Minimum 32-character secret string
   - `OTP_HMAC_SECRET`: Minimum 32-character HMAC secret string
   - `EXPOSE_OTP_IN_RESPONSE`: Set to `true` during development to expose `devOtp` in signup/signin API responses.

> [!CAUTION]
> The application will **fail startup immediately** if `NODE_ENV=production` while `EXPOSE_OTP_IN_RESPONSE=true` or `SMS_PROVIDER=console`.

---

## Running Migrations & Seed Data

1. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

2. **Run Database Migrations**:
   ```bash
   npm run prisma:migrate
   ```

3. **Seed Test Users**:
   ```bash
   npm run seed
   ```
   *Seeds initial test accounts:*
   - Buyer (`USER`): `9876543210` (`USR100001`)
   - Seller (`VENDOR`): `9876543211` (`VND100001`)

---

## Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  # or
  npm run start:dev
  ```

- **Production Build & Start**:
  ```bash
  npm run build
  npm run start:prod
  ```

---

## Running Tests

- **Unit Tests**:
  ```bash
  npm run test
  ```

- **E2E Integration Tests**:
  ```bash
  npm run test:e2e
  ```

- **Linting & Type Check**:
  ```bash
  npm run lint
  npm run build
  ```

---

## Testing the Full Flow in Swagger UI

1. Start the server (`npm run start:dev`) and open **`http://localhost:3000/api/docs`** in your browser.

2. **Signup Request**:
   - Expand `POST /api/auth/signup`.
   - Click **Try it out** and enter body:
     ```json
     {
       "type": "USER",
       "firstName": "Yogesh",
       "lastName": "Soni",
       "mobileNumber": "9876543210",
       "email": "yogesh.test@example.com"
     }
     ```
   - Click **Execute**.
   - Copy the 6-digit `devOtp` returned in `data.devOtp` (e.g. `"123456"`).

3. **Verify Signup OTP**:
   - Expand `POST /api/auth/signup/verify-otp`.
   - Click **Try it out** and enter body:
     ```json
     {
       "mobileNumber": "9876543210",
       "otp": "123456"
     }
     ```
   - Click **Execute**.
   - Copy the JWT string returned in `data.token`.

4. **Authorize Bearer Token**:
   - Click the green **Authorize** button at the top right of Swagger UI.
   - Paste the copied JWT token into the **Value** input field.
   - Click **Authorize**, then click **Close**.

5. **Access Protected Account Profile**:
   - Expand `GET /api/auth/me`.
   - Click **Try it out** -> **Execute**.
   - Verify the profile response returns user details (`USR100001`).

6. **Signin Flow**:
   - Call `POST /api/auth/signin` with `{ "type": "USER", "mobileNumber": "9876543210" }`.
   - Copy `devOtp` from response.
   - Call `POST /api/auth/signin/verify-otp` with `{ "type": "USER", "mobileNumber": "9876543210", "otp": "123456" }`.
