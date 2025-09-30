import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ActivitiesService } from './activities.service';
import { CreateSalesActivityDto, UpdateSalesActivityDto, CreateLeadDto, UpdateLeadDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // Sales Activities
  @Get('sales')
  @Roles(UserRole.SALES, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get sales activities' })
  @ApiResponse({ status: 200, description: 'Sales activities retrieved successfully' })
  getSalesActivities(@CurrentUser() user: any) {
    return this.activitiesService.getSalesActivities(user.id, user.role);
  }

  @Get('sales/:id')
  @Roles(UserRole.SALES, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get sales activity by ID' })
  @ApiResponse({ status: 200, description: 'Sales activity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sales activity not found' })
  getSalesActivity(@Param('id') id: string) {
    return this.activitiesService.getSalesActivityById(id);
  }

  @Post('sales')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Create sales activity' })
  @ApiResponse({ status: 201, description: 'Sales activity created successfully' })
  createSalesActivity(@Body() dto: CreateSalesActivityDto, @CurrentUser() user: any) {
    return this.activitiesService.createSalesActivity(dto, user.id);
  }

  @Patch('sales/:id')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Update sales activity' })
  @ApiResponse({ status: 200, description: 'Sales activity updated successfully' })
  updateSalesActivity(@Param('id') id: string, @Body() dto: UpdateSalesActivityDto) {
    return this.activitiesService.updateSalesActivity(id, dto);
  }

  @Delete('sales/:id')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Delete sales activity' })
  @ApiResponse({ status: 200, description: 'Sales activity deleted successfully' })
  deleteSalesActivity(@Param('id') id: string) {
    return this.activitiesService.deleteSalesActivity(id);
  }

  // Leads
  @Get('leads')
  @Roles(UserRole.SALES, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get leads' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  getLeads(@CurrentUser() user: any) {
    return this.activitiesService.getLeads(user.id, user.role);
  }

  @Get('leads/:id')
  @Roles(UserRole.SALES, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  getLead(@Param('id') id: string) {
    return this.activitiesService.getLeadById(id);
  }

  @Post('leads')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Create lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  createLead(@Body() dto: CreateLeadDto, @CurrentUser() user: any) {
    return this.activitiesService.createLead(dto, user.id);
  }

  @Patch('leads/:id')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.activitiesService.updateLead(id, dto);
  }

  @Delete('leads/:id')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  deleteLead(@Param('id') id: string) {
    return this.activitiesService.deleteLead(id);
  }
}