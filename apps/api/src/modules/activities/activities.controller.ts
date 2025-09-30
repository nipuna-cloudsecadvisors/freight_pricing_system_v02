import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateSalesActivityDto } from './dto/create-sales-activity.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SalesActivityType } from '@prisma/client';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create sales activity' })
  async createSalesActivity(
    @Body() createSalesActivityDto: CreateSalesActivityDto,
    @CurrentUser() user: any,
  ) {
    return this.activitiesService.createSalesActivity(createSalesActivityDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get sales activities' })
  async getSalesActivities(
    @Query('customerId') customerId?: string,
    @Query('leadId') leadId?: string,
    @Query('type') type?: SalesActivityType,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @CurrentUser() user: any,
  ) {
    return this.activitiesService.getSalesActivities({
      userId: user.sub,
      customerId,
      leadId,
      type,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my sales activities' })
  async getMyActivities(
    @Query('limit') limit?: number,
    @CurrentUser() user: any,
  ) {
    return this.activitiesService.getActivitiesByUser(user.sub, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales activity by ID' })
  async getSalesActivityById(@Param('id') id: string) {
    return this.activitiesService.getSalesActivityById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sales activity' })
  async updateSalesActivity(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSalesActivityDto>,
  ) {
    return this.activitiesService.updateSalesActivity(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sales activity' })
  async deleteSalesActivity(@Param('id') id: string) {
    return this.activitiesService.deleteSalesActivity(id);
  }
}
