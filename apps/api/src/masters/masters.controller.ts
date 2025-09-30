import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { MastersService } from './masters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Masters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get('ports')
  @ApiOperation({ summary: 'Get all ports' })
  @ApiResponse({ status: 200, description: 'Ports retrieved successfully' })
  getPorts() {
    return this.mastersService.getPorts();
  }

  @Post('ports')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new port' })
  @ApiResponse({ status: 201, description: 'Port created successfully' })
  createPort(@Body() data: { unlocode: string; name: string; country: string }) {
    return this.mastersService.createPort(data);
  }

  @Get('trade-lanes')
  @ApiOperation({ summary: 'Get all trade lanes' })
  @ApiResponse({ status: 200, description: 'Trade lanes retrieved successfully' })
  getTradeLanes() {
    return this.mastersService.getTradeLanes();
  }

  @Post('trade-lanes')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new trade lane' })
  @ApiResponse({ status: 201, description: 'Trade lane created successfully' })
  createTradeLane(@Body() data: { region: string; name: string; code: string }) {
    return this.mastersService.createTradeLane(data);
  }

  @Get('equipment-types')
  @ApiOperation({ summary: 'Get all equipment types' })
  @ApiResponse({ status: 200, description: 'Equipment types retrieved successfully' })
  getEquipmentTypes() {
    return this.mastersService.getEquipmentTypes();
  }

  @Post('equipment-types')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new equipment type' })
  @ApiResponse({ status: 201, description: 'Equipment type created successfully' })
  createEquipmentType(@Body() data: { 
    name: string; 
    isReefer?: boolean; 
    isFlatRackOpenTop?: boolean 
  }) {
    return this.mastersService.createEquipmentType(data);
  }

  @Get('shipping-lines')
  @ApiOperation({ summary: 'Get all shipping lines' })
  @ApiResponse({ status: 200, description: 'Shipping lines retrieved successfully' })
  getShippingLines() {
    return this.mastersService.getShippingLines();
  }

  @Post('shipping-lines')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new shipping line' })
  @ApiResponse({ status: 201, description: 'Shipping line created successfully' })
  createShippingLine(@Body() data: { name: string; code: string }) {
    return this.mastersService.createShippingLine(data);
  }

  @Get('sbus')
  @ApiOperation({ summary: 'Get all SBUs' })
  @ApiResponse({ status: 200, description: 'SBUs retrieved successfully' })
  getSbus() {
    return this.mastersService.getSbus();
  }
}