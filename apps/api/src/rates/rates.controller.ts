import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { RatesService } from './rates.service';
import { 
  CreatePredefinedRateDto, 
  UpdatePredefinedRateDto, 
  CreateRateRequestDto,
  CreateRateRequestResponseDto,
  CreateLineQuoteDto,
  RequestRateUpdateDto,
  RejectRateRequestDto,
  GetPredefinedRatesQueryDto,
  GetRateRequestsQueryDto
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  // Predefined Rates
  @Get('predefined')
  @ApiOperation({ summary: 'Get predefined rates' })
  @ApiResponse({ status: 200, description: 'Predefined rates retrieved successfully' })
  getPredefinedRates(@Query() query: GetPredefinedRatesQueryDto) {
    return this.ratesService.getPredefinedRates(query);
  }

  @Post('predefined')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Create predefined rate' })
  @ApiResponse({ status: 201, description: 'Predefined rate created successfully' })
  createPredefinedRate(
    @Body() dto: CreatePredefinedRateDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.createPredefinedRate(dto, user.id);
  }

  @Patch('predefined/:id')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Update predefined rate' })
  @ApiResponse({ status: 200, description: 'Predefined rate updated successfully' })
  updatePredefinedRate(
    @Param('id') id: string,
    @Body() dto: UpdatePredefinedRateDto
  ) {
    return this.ratesService.updatePredefinedRate(id, dto);
  }

  @Post('predefined/:id/request-update')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Request update for expired predefined rate' })
  @ApiResponse({ status: 201, description: 'Update request created successfully' })
  requestRateUpdate(
    @Param('id') id: string,
    @Body() dto: RequestRateUpdateDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.requestRateUpdate(id, dto, user.id);
  }

  // Rate Requests
  @Get('requests')
  @ApiOperation({ summary: 'Get rate requests' })
  @ApiResponse({ status: 200, description: 'Rate requests retrieved successfully' })
  getRateRequests(
    @Query() query: GetRateRequestsQueryDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.getRateRequests(query, user.id, user.role);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get rate request by ID' })
  @ApiResponse({ status: 200, description: 'Rate request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Rate request not found' })
  getRateRequest(@Param('id') id: string) {
    return this.ratesService.getRateRequestById(id);
  }

  @Post('requests')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Create rate request' })
  @ApiResponse({ status: 201, description: 'Rate request created successfully' })
  createRateRequest(
    @Body() dto: CreateRateRequestDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.createRateRequest(dto, user.id);
  }

  @Post('requests/:id/respond')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Respond to rate request' })
  @ApiResponse({ status: 201, description: 'Response added successfully' })
  respondToRateRequest(
    @Param('id') id: string,
    @Body() dto: CreateRateRequestResponseDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.respondToRateRequest(id, dto, user.id);
  }

  @Post('requests/:id/line-quotes')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Add line quote to rate request' })
  @ApiResponse({ status: 201, description: 'Line quote added successfully' })
  createLineQuote(
    @Param('id') id: string,
    @Body() dto: CreateLineQuoteDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.createLineQuote(id, dto, user.id);
  }

  @Post('requests/:id/complete')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Mark rate request as completed' })
  @ApiResponse({ status: 200, description: 'Rate request completed successfully' })
  completeRateRequest(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.ratesService.completeRateRequest(id, user.id);
  }

  @Post('requests/:id/reject')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Reject rate request' })
  @ApiResponse({ status: 200, description: 'Rate request rejected successfully' })
  rejectRateRequest(
    @Param('id') id: string,
    @Body() dto: RejectRateRequestDto,
    @CurrentUser() user: any
  ) {
    return this.ratesService.rejectRateRequest(id, dto.remark, user.id);
  }
}