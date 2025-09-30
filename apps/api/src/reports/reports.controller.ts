import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('response-time')
  @Roles('ADMIN', 'SBU_HEAD', 'MGMT')
  @ApiOperation({ summary: 'Get average response time for rate requests' })
  @ApiResponse({ status: 200, description: 'Response time report retrieved successfully' })
  getResponseTimeReport() {
    return this.reportsService.getResponseTimeReport();
  }

  @Get('top-sps')
  @Roles('ADMIN', 'SBU_HEAD', 'MGMT')
  @ApiOperation({ summary: 'Get top 10 salespersons by request count' })
  @ApiResponse({ status: 200, description: 'Top SPs report retrieved successfully' })
  getTopSPsReport() {
    return this.reportsService.getTopSPsReport();
  }

  @Get('status-cards')
  @Roles('ADMIN', 'SBU_HEAD', 'MGMT')
  @ApiOperation({ summary: 'Get status cards for rate requests' })
  @ApiResponse({ status: 200, description: 'Status cards report retrieved successfully' })
  getStatusCardsReport() {
    return this.reportsService.getStatusCardsReport();
  }

  @Get('dashboard/export-jpeg')
  @Roles('ADMIN', 'SBU_HEAD', 'MGMT')
  @ApiOperation({ summary: 'Export dashboard to JPEG' })
  @ApiResponse({ status: 200, description: 'Dashboard exported successfully' })
  exportDashboardToJPEG() {
    return this.reportsService.exportDashboardToJPEG();
  }
}