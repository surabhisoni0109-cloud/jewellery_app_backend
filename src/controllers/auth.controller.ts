import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { SignupVerifyDto } from '../dto/signup-verify.dto';
import { SigninDto } from '../dto/signin.dto';
import { SigninVerifyDto } from '../dto/signin-verify.dto';
import {
  AuthSessionResponseDto,
  OtpResponseDto,
  UserResponseDto,
} from '../dto/auth-response.dto';
import { ApiWrappedResponse } from '../common/decorators/api-response-wrapper.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request Signup OTP',
    description:
      'Validates signup details, checks for existing user duplicates, stores pending payload in Redis and dispatches OTP SMS.',
  })
  @ApiWrappedResponse(OtpResponseDto, 200, 'OTP sent successfully')
  @ApiResponse({
    status: 400,
    description: 'Validation failed (INVALID_TYPE or INVALID_MOBILE)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists (MOBILE_ALREADY_EXISTS or EMAIL_ALREADY_EXISTS)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit or resend cooldown exceeded (OTP_LIMIT_EXCEEDED)',
    type: ApiErrorResponseDto,
  })
  async signup(@Body() signupDto: SignupDto) {
    const result = await this.authService.signup(signupDto);
    return {
      message: 'OTP sent successfully',
      data: result,
    };
  }

  @Post('signup/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Verify Signup OTP & Create Account',
    description:
      'Verifies the pending signup OTP, creates the user account in PostgreSQL, and returns a JWT access token.',
  })
  @ApiWrappedResponse(AuthSessionResponseDto, 201, 'Signup successful')
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP (INVALID_OTP or OTP_EXPIRED)',
    type: ApiErrorResponseDto,
  })
  async verifySignupOtp(@Body() signupVerifyDto: SignupVerifyDto) {
    const session = await this.authService.verifySignupOtp(signupVerifyDto);
    return {
      message: 'Registration completed successfully',
      data: session,
    };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request Signin OTP',
    description:
      'Validates registered user mobile and type, verifies active account status, and dispatches signin OTP SMS.',
  })
  @ApiWrappedResponse(OtpResponseDto, 200, 'OTP sent successfully')
  @ApiResponse({
    status: 400,
    description: 'Validation failed (INVALID_TYPE or INVALID_MOBILE)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Account is blocked (ACCOUNT_BLOCKED)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not registered (USER_NOT_FOUND)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit or resend cooldown exceeded (OTP_LIMIT_EXCEEDED)',
    type: ApiErrorResponseDto,
  })
  async signin(@Body() signinDto: SigninDto) {
    const result = await this.authService.signin(signinDto);
    return {
      message: 'OTP sent successfully',
      data: result,
    };
  }

  @Post('signin/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Signin OTP & Authenticate',
    description:
      'Verifies the signin OTP, validates user status, and issues a JWT access token.',
  })
  @ApiWrappedResponse(AuthSessionResponseDto, 200, 'Signin successful')
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP (INVALID_OTP or OTP_EXPIRED)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Account is blocked (ACCOUNT_BLOCKED)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found (USER_NOT_FOUND)',
    type: ApiErrorResponseDto,
  })
  async verifySigninOtp(@Body() signinVerifyDto: SigninVerifyDto) {
    const session = await this.authService.verifySigninOtp(signinVerifyDto);
    return {
      message: 'Signin successful',
      data: session,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Current Authenticated Account',
    description: 'Returns the profile of the currently logged-in user or vendor.',
  })
  @ApiWrappedResponse(UserResponseDto, 200, 'Profile fetched successfully')
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired JWT bearer token (UNAUTHORIZED)',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Account has been blocked (ACCOUNT_BLOCKED)',
    type: ApiErrorResponseDto,
  })
  async getMe(@CurrentUser() user: User) {
    return {
      message: 'Profile fetched successfully',
      data: user,
    };
  }
}
