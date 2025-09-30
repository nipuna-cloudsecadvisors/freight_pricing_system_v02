import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { MastersService } from './masters.service';
import { CreatePortDto } from './dto/create-port.dto';
import { CreateTradeLaneDto } from './dto/create-trade-lane.dto';
import { CreateEquipmentTypeDto } from './dto/create-equipment-type.dto';
import { CreateShippingLineDto } from './dto/create-shipping-line.dto';
import { CreateSBUDto } from './dto/create-sbu.dto';
import { CreatePricingAssignmentDto } from './dto/create-pricing-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Masters')
@Controller('masters')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  // Ports
  @Get('ports')
  @ApiOperation({ summary: 'Get all ports' })
  @ApiResponse({ status: 200, description: 'Ports retrieved successfully' })
  getPorts() {
    return this.mastersService.getPorts();
  }

  @Post('ports')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new port' })
  @ApiResponse({ status: 201, description: 'Port created successfully' })
  createPort(@Body() createPortDto: CreatePortDto) {
    return this.mastersService.createPort(createPortDto);
  }

  // Trade Lanes
  @Get('trade-lanes')
  @ApiOperation({ summary: 'Get all trade lanes' })
  @ApiResponse({ status: 200, description: 'Trade lanes retrieved successfully' })
  getTradeLanes() {
    return this.mastersService.getTradeLanes();
  }

  @Post('trade-lanes')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new trade lane' })
  @ApiResponse({ status: 201, description: 'Trade lane created successfully' })
  createTradeLane(@Body() createTradeLaneDto: CreateTradeLaneDto) {
    return this.mastersService.createTradeLane(createTradeLaneDto);
  }

  // Equipment Types
  @Get('equipment-types')
  @ApiOperation({ summary: 'Get all equipment types' })
  @ApiResponse({ status: 200, description: 'Equipment types retrieved successfully' })
  getEquipmentTypes() {
    return this.mastersService.getEquipmentTypes();
  }

  @Post('equipment-types')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new equipment type' })
  @ApiResponse({ status: 201, description: 'Equipment type created successfully' })
  createEquipmentType(@Body() createEquipmentTypeDto: CreateEquipmentTypeDto) {
    return this.mastersService.createEquipmentType(createEquipmentTypeDto);
  }

  // Shipping Lines
  @Get('shipping-lines')
  @ApiOperation({ summary: 'Get all shipping lines' })
  @ApiResponse({ status: 200, description: 'Shipping lines retrieved successfully' })
  getShippingLines() {
    return this.mastersService.getShippingLines();
  }

  @Post('shipping-lines')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new shipping line' })
  @ApiResponse({ status: 201, description: 'Shipping line created successfully' })
  createShippingLine(@Body() createShippingLineDto: CreateShippingLineDto) {
    return this.mastersService.createShippingLine(createShippingLineDto);
  }

  // SBUs
  @Get('sbus')
  @ApiOperation({ summary: 'Get all SBUs' })
  @ApiResponse({ status: 200, description: 'SBUs retrieved successfully' })
  getSBUs() {
    return this.mastersService.getSBUs();
  }

  @Post('sbus')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new SBU' })
  @ApiResponse({ status: 201, description: 'SBU created successfully' })
  createSBU(@Body() createSBUDto: CreateSBUDto) {
    return this.mastersService.createSBU(createSBUDto);
  }

  // Pricing Assignments
  @Get('pricing-assignments')
  @ApiOperation({ summary: 'Get all pricing team assignments' })
  @ApiResponse({ status: 200, description: 'Pricing assignments retrieved successfully' })
  getPricingAssignments() {
    return this.mastersService.getPricingAssignments();
  }

  @Post('pricing-assignments')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new pricing team assignment' })
  @ApiResponse({ status: 201, description: 'Pricing assignment created successfully' })
  createPricingAssignment(@Body() createPricingAssignmentDto: CreatePricingAssignmentDto) {
    return this.mastersService.createPricingAssignment(createPricingAssignmentDto);
  }

  @Delete('pricing-assignments/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete pricing team assignment' })
  @ApiResponse({ status: 200, description: 'Pricing assignment deleted successfully' })
  deletePricingAssignment(@Param('id') id: string) {
    return this.mastersService.deletePricingAssignment(id);
  }
}