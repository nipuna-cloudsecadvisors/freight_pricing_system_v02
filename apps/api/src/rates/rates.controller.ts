import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { PredefinedRatesService } from './predefined-rates.service';
import { RateRequestsService } from './rate-requests.service';
import { CreatePredefinedRateDto } from './dto/create-predefined-rate.dto';
import { UpdatePredefinedRateDto } from './dto/update-predefined-rate.dto';
import { RequestRateUpdateDto } from './dto/request-rate-update.dto';
import { CreateRateRequestDto } from './dto/create-rate-request.dto';
import { UpdateRateRequestDto } from './dto/update-rate-request.dto';
import { RespondToRateRequestDto } from './dto/respond-to-rate-request.dto';
import { CreateLineQuoteDto } from './dto/create-line-quote.dto';
import { CompleteRateRequestDto } from './dto/complete-rate-request.dto';
import { RejectRateRequestDto } from './dto/reject-rate-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Rates')
@Controller('rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RatesController {
  constructor(
    private readonly predefinedRatesService: PredefinedRatesService,
    private readonly rateRequestsService: RateRequestsService,
  ) {}

  // Predefined Rates
  @Get('predefined')
  @ApiOperation({ summary: 'Get predefined rates with filters' })
  @ApiResponse({ status: 200, description: 'Predefined rates retrieved successfully' })
  getPredefinedRates(
    @Query('region') region?: string,
    @Query('pol') polId?: string,
    @Query('pod') podId?: string,
    @Query('service') service?: string,
    @Query('equip') equipTypeId?: string,
    @Query('status') status?: string,
  ) {
    return this.predefinedRatesService.findAll({
      region,
      polId,
      podId,
      service,
      equipTypeId,
      status,
    });
  }

  @Post('predefined')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Create a new predefined rate' })
  @ApiResponse({ status: 201, description: 'Predefined rate created successfully' })
  createPredefinedRate(@Body() createDto: CreatePredefinedRateDto) {
    return this.predefinedRatesService.create(createDto);
  }

  @Get('predefined/:id')
  @ApiOperation({ summary: 'Get predefined rate by ID' })
  @ApiResponse({ status: 200, description: 'Predefined rate retrieved successfully' })
  getPredefinedRate(@Param('id') id: string) {
    return this.predefinedRatesService.findById(id);
  }

  @Patch('predefined/:id')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Update predefined rate' })
  @ApiResponse({ status: 200, description: 'Predefined rate updated successfully' })
  updatePredefinedRate(@Param('id') id: string, @Body() updateDto: UpdatePredefinedRateDto) {
    return this.predefinedRatesService.update(id, updateDto);
  }

  @Delete('predefined/:id')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Delete predefined rate' })
  @ApiResponse({ status: 200, description: 'Predefined rate deleted successfully' })
  deletePredefinedRate(@Param('id') id: string) {
    return this.predefinedRatesService.remove(id);
  }

  @Post('predefined/:id/request-update')
  @Roles('SALES')
  @ApiOperation({ summary: 'Request update for expired predefined rate' })
  @ApiResponse({ status: 200, description: 'Rate update request sent to pricing team' })
  requestRateUpdate(@Param('id') id: string, @Body() requestDto: RequestRateUpdateDto, @Request() req) {
    return this.predefinedRatesService.requestUpdate(id, requestDto, req.user.id);
  }

  // Rate Requests
  @Post('requests')
  @Roles('SALES')
  @ApiOperation({ summary: 'Create a new rate request' })
  @ApiResponse({ status: 201, description: 'Rate request created successfully' })
  createRateRequest(@Body() createDto: CreateRateRequestDto, @Request() req) {
    return this.rateRequestsService.create(createDto, req.user.id);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get rate requests with filters' })
  @ApiResponse({ status: 200, description: 'Rate requests retrieved successfully' })
  getRateRequests(
    @Query('status') status?: string,
    @Query('mine') mine?: string,
    @Request() req,
  ) {
    return this.rateRequestsService.findAll({
      status,
      mine: mine === 'true',
      salespersonId: req.user.id,
    });
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get rate request by ID' })
  @ApiResponse({ status: 200, description: 'Rate request retrieved successfully' })
  getRateRequest(@Param('id') id: string) {
    return this.rateRequestsService.findById(id);
  }

  @Patch('requests/:id')
  @Roles('SALES')
  @ApiOperation({ summary: 'Update rate request (only if pending)' })
  @ApiResponse({ status: 200, description: 'Rate request updated successfully' })
  updateRateRequest(@Param('id') id: string, @Body() updateDto: UpdateRateRequestDto) {
    return this.rateRequestsService.update(id, updateDto);
  }

  @Post('requests/:id/respond')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Respond to rate request with multiple lines' })
  @ApiResponse({ status: 201, description: 'Response added successfully' })
  respondToRateRequest(@Param('id') id: string, @Body() respondDto: RespondToRateRequestDto) {
    return this.rateRequestsService.respond(id, respondDto);
  }

  @Post('requests/:id/line-quotes')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Create line quote for rate request' })
  @ApiResponse({ status: 201, description: 'Line quote created successfully' })
  createLineQuote(@Param('id') id: string, @Body() createDto: CreateLineQuoteDto) {
    return this.rateRequestsService.createLineQuote(id, createDto);
  }

  @Post('requests/:id/complete')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Mark rate request as completed' })
  @ApiResponse({ status: 200, description: 'Rate request completed successfully' })
  completeRateRequest(@Param('id') id: string, @Body() completeDto: CompleteRateRequestDto) {
    return this.rateRequestsService.complete(id, completeDto);
  }

  @Post('requests/:id/reject')
  @Roles('PRICING')
  @ApiOperation({ summary: 'Reject rate request with reason' })
  @ApiResponse({ status: 200, description: 'Rate request rejected successfully' })
  rejectRateRequest(@Param('id') id: string, @Body() rejectDto: RejectRateRequestDto) {
    return this.rateRequestsService.reject(id, rejectDto);
  }
}