import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MastersService } from './masters.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Masters')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  // Ports
  @Get('ports')
  @ApiOperation({ summary: 'Get all ports' })
  async getPorts(@Query('search') search?: string) {
    return this.mastersService.getPorts(search);
  }

  @Post('ports')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new port' })
  async createPort(@Body() data: { unlocode: string; name: string; country: string }) {
    return this.mastersService.createPort(data);
  }

  // Trade Lanes
  @Get('trade-lanes')
  @ApiOperation({ summary: 'Get all trade lanes' })
  async getTradeLanes(@Query('region') region?: string) {
    return this.mastersService.getTradeLanes(region);
  }

  @Post('trade-lanes')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new trade lane' })
  async createTradeLane(@Body() data: { region: string; name: string; code: string }) {
    return this.mastersService.createTradeLane(data);
  }

  // Equipment Types
  @Get('equipment-types')
  @ApiOperation({ summary: 'Get all equipment types' })
  async getEquipmentTypes() {
    return this.mastersService.getEquipmentTypes();
  }

  @Post('equipment-types')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new equipment type' })
  async createEquipmentType(@Body() data: { 
    name: string; 
    isReefer?: boolean; 
    isFlatRackOpenTop?: boolean; 
  }) {
    return this.mastersService.createEquipmentType(data);
  }

  // Shipping Lines
  @Get('shipping-lines')
  @ApiOperation({ summary: 'Get all shipping lines' })
  async getShippingLines(@Query('search') search?: string) {
    return this.mastersService.getShippingLines(search);
  }

  @Post('shipping-lines')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new shipping line' })
  async createShippingLine(@Body() data: { name: string; code: string }) {
    return this.mastersService.createShippingLine(data);
  }

  // SBUs
  @Get('sbus')
  @ApiOperation({ summary: 'Get all SBUs' })
  async getSbus() {
    return this.mastersService.getSbus();
  }

  @Post('sbus')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new SBU' })
  async createSbu(@Body() data: { name: string; headUserId: string }) {
    return this.mastersService.createSbu(data);
  }
}
