import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApproveCustomerDto } from './dto/approve-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Create a new customer (requires admin approval)' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    return this.customersService.create(createCustomerDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  findAll(@Query('includePending') includePending?: string) {
    return this.customersService.findAll(includePending === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Patch(':id')
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Update customer (only if pending approval)' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 403, description: 'Cannot update approved customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Post(':id/approve')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve or reject customer' })
  @ApiResponse({ status: 200, description: 'Customer approval status updated' })
  @ApiResponse({ status: 403, description: 'Customer is not pending approval' })
  approve(@Param('id') id: string, @Body() approveDto: ApproveCustomerDto, @Request() req) {
    return this.customersService.approve(id, approveDto, req.user.id);
  }

  @Delete(':id')
  @Roles('SALES', 'CSE')
  @ApiOperation({ summary: 'Delete customer (only if pending approval)' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete approved customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}