import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sales activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  create(@Body() createDto: any, @Request() req) {
    return this.activitiesService.create(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get sales activities' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  findAll(@Request() req) {
    return this.activitiesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.activitiesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}