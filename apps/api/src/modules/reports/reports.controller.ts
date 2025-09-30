import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('response-time')
  @Roles(UserRole.ADMIN, UserRole.SBU_HEAD, UserRole.MGMT)
  @ApiOperation({ summary: 'Get average response time for rate requests' })
  async getResponseTimeReport() {
    return this.reportsService.getResponseTimeReport();
  }

  @Get('top-sps')
  @Roles(UserRole.ADMIN, UserRole.SBU_HEAD, UserRole.MGMT)
  @ApiOperation({ summary: 'Get top salespersons by request count' })
  async getTopSalesPersons() {
    return this.reportsService.getTopSalesPersons();
  }

  @Get('status-cards')
  @ApiOperation({ summary: 'Get status cards for rate requests' })
  async getStatusCards() {
    return this.reportsService.getStatusCards();
  }

  @Get('booking-status-cards')
  @ApiOperation({ summary: 'Get status cards for booking requests' })
  async getBookingStatusCards() {
    return this.reportsService.getBookingStatusCards();
  }

  @Get('customer-approval-stats')
  @Roles(UserRole.ADMIN, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get customer approval statistics' })
  async getCustomerApprovalStats() {
    return this.reportsService.getCustomerApprovalStats();
  }
}
