import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data based on user role' })
  async getDashboardData(@CurrentUser() user: any) {
    return this.dashboardService.getDashboardData(user.role, user.sub);
  }

  @Get('export-jpeg')
  @ApiOperation({ summary: 'Export dashboard as JPEG' })
  async exportDashboardAsJpeg() {
    return this.dashboardService.exportDashboardAsJpeg();
  }
}
