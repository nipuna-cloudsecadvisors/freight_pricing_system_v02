import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ItineraryService } from './itinerary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Itineraries')
@Controller('itineraries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Post()
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Create a new itinerary' })
  @ApiResponse({ status: 201, description: 'Itinerary created successfully' })
  create(@Body() createDto: any, @Request() req) {
    return this.itineraryService.create(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get itineraries' })
  @ApiResponse({ status: 200, description: 'Itineraries retrieved successfully' })
  findAll(@Request() req) {
    return this.itineraryService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get itinerary by ID' })
  @ApiResponse({ status: 200, description: 'Itinerary retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.itineraryService.findById(id);
  }

  @Post(':id/submit')
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Submit itinerary for approval' })
  @ApiResponse({ status: 200, description: 'Itinerary submitted successfully' })
  submit(@Param('id') id: string, @Request() req) {
    return this.itineraryService.submit(id, req.user.id);
  }

  @Post(':id/approve')
  @Roles('SBU_HEAD')
  @ApiOperation({ summary: 'Approve or reject itinerary' })
  @ApiResponse({ status: 200, description: 'Itinerary decision made successfully' })
  approve(@Param('id') id: string, @Body() approveDto: any, @Request() req) {
    return this.itineraryService.approve(id, approveDto, req.user.id);
  }

  @Post(':id/items')
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Add item to itinerary' })
  @ApiResponse({ status: 201, description: 'Item added successfully' })
  addItem(@Param('id') itineraryId: string, @Body() createDto: any) {
    return this.itineraryService.addItem(itineraryId, createDto);
  }

  @Patch('items/:itemId')
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Update itinerary item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  updateItem(@Param('itemId') itemId: string, @Body() updateDto: any) {
    return this.itineraryService.updateItem(itemId, updateDto);
  }

  @Delete('items/:itemId')
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Remove itinerary item' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  removeItem(@Param('itemId') itemId: string) {
    return this.itineraryService.removeItem(itemId);
  }
}