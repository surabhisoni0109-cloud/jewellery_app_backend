import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import {
  AdminLoginDto,
  AdminUpdateProfileDto,
  AdminChangePasswordDto,
} from '../dto/admin.dto';
import { Admin } from '@prisma/client';

// Custom decorator to extract admin from request
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Admin => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Public ────────────────────────────────────────────

  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login with email and password' })
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  // ── Protected ─────────────────────────────────────────

  @Get('auth/me')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current admin profile' })
  getMe(@CurrentAdmin() admin: Admin) {
    return this.adminService.getMe(admin.id);
  }

  @Patch('auth/profile')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @UseInterceptors(
    FileInterceptor('avatar', { storage: memoryStorage() }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update admin profile (name, email, avatar)' })
  updateProfile(
    @CurrentAdmin() admin: Admin,
    @Body() dto: AdminUpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.adminService.updateProfile(admin.id, dto, avatar);
  }

  @Patch('auth/change-password')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Admin change password' })
  changePassword(
    @CurrentAdmin() admin: Admin,
    @Body() dto: AdminChangePasswordDto,
  ) {
    return this.adminService.changePassword(admin.id, dto);
  }

  // ── Dashboard ─────────────────────────────────────────

  @Get('dashboard')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ── Users ─────────────────────────────────────────────

  @Get('users')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List all users (type=USER)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Patch('users/:id/status')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Toggle user Active/Blocked status' })
  toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  // ── Vendors ───────────────────────────────────────────

  @Get('vendors')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List all vendors (type=VENDOR)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  getVendors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getVendors(page, limit, search);
  }

  @Patch('vendors/:id/status')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Toggle vendor Active/Blocked status' })
  toggleVendorStatus(@Param('id') id: string) {
    return this.adminService.toggleVendorStatus(id);
  }
}
