import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('response-time')
  @Roles(UserRole.SBU_HEAD, UserRole.MGMT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get average response time report' })
  @ApiResponse({ status: 200, description: 'Response time report retrieved successfully' })
  getResponseTimeReport() {
    return this.reportsService.getResponseTimeReport();
  }

  @Get('top-sps')
  @Roles(UserRole.SBU_HEAD, UserRole.MGMT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get top salespersons by request count' })
  @ApiResponse({ status: 200, description: 'Top salespersons report retrieved successfully' })
  getTopSalespersons() {
    return this.reportsService.getTopSalespersons();
  }

  @Get('status-cards')
  @Roles(UserRole.SBU_HEAD, UserRole.MGMT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get status cards data' })
  @ApiResponse({ status: 200, description: 'Status cards data retrieved successfully' })
  getStatusCards() {
    return this.reportsService.getStatusCards();
  }

  @Get('dashboard')
  @Roles(UserRole.SBU_HEAD, UserRole.MGMT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getDashboardData() {
    return this.reportsService.getDashboardData();
  }

  @Get('dashboard/export-jpeg')
  @Roles(UserRole.SBU_HEAD, UserRole.MGMT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export dashboard as JPEG' })
  @ApiResponse({ status: 200, description: 'Dashboard exported as JPEG' })
  async exportDashboardJpeg(@Res() res: Response) {
    // This would typically use a library like puppeteer to generate JPEG from dashboard
    // For now, return a placeholder response
    res.setHeader('Content-Type', 'application/json');
    res.json({
      message: 'Dashboard export feature will be implemented with frontend',
      exportUrl: '/api/reports/dashboard/export-jpeg',
      format: 'JPEG'
    });
  }
}