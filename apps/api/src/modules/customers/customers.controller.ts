import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, CustomerApprovalStatus } from '@prisma/client';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Create new customer' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.create(createCustomerDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  async findAll(
    @Query('status') status?: CustomerApprovalStatus,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(status, search);
  }

  @Get('approved')
  @ApiOperation({ summary: 'Get approved customers only' })
  async getApprovedCustomers() {
    return this.customersService.getApprovedCustomers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Update customer' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve customer' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.approve(id, user.sub);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject customer' })
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.reject(id, user.sub);
  }
}
