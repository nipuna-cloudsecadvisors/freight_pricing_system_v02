import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('search')
  @ApiOperation({ summary: 'Global search across all tables' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  globalSearch(@Query('q') query: string) {
    return this.adminService.globalSearch(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  getAuditLogs(@Query('limit') limit?: string) {
    return this.adminService.getAuditLogs(limit ? parseInt(limit) : 50);
  }
}