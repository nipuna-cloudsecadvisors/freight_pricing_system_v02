import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatesService } from './rates.service';
import { CreateRateRequestDto } from './dto/create-rate-request.dto';
import { CreatePredefinedRateDto } from './dto/create-predefined-rate.dto';
import { RateRequestResponseDto } from './dto/rate-request-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, RateRequestStatus } from '@prisma/client';

@ApiTags('Rates')
@Controller('rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  // Predefined Rates
  @Get('predefined')
  @ApiOperation({ summary: 'Get predefined rates' })
  async getPredefinedRates(
    @Query('region') region?: string,
    @Query('polId') polId?: string,
    @Query('podId') podId?: string,
    @Query('service') service?: string,
    @Query('equipTypeId') equipTypeId?: string,
    @Query('status') status?: string,
  ) {
    return this.ratesService.getPredefinedRates({
      region,
      polId,
      podId,
      service,
      equipTypeId,
      status,
    });
  }

  @Post('predefined')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Create predefined rate' })
  async createPredefinedRate(@Body() createPredefinedRateDto: CreatePredefinedRateDto) {
    return this.ratesService.createPredefinedRate(createPredefinedRateDto);
  }

  @Post('predefined/:id/request-update')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Request rate update' })
  async requestRateUpdate(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ratesService.requestRateUpdate(id, user.sub);
  }

  // Rate Requests
  @Post('requests')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Create rate request' })
  async createRateRequest(
    @Body() createRateRequestDto: CreateRateRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.ratesService.createRateRequest(createRateRequestDto, user.sub);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get rate requests' })
  async getRateRequests(
    @Query('status') status?: RateRequestStatus,
    @Query('mine') mine?: boolean,
    @CurrentUser() user: any,
  ) {
    return this.ratesService.getRateRequests({
      status,
      mine: mine === true,
      userId: user.sub,
    });
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get rate request by ID' })
  async getRateRequestById(@Param('id') id: string) {
    return this.ratesService.getRateRequestById(id);
  }

  @Post('requests/:id/respond')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Respond to rate request' })
  async respondToRateRequest(
    @Param('id') id: string,
    @Body() responseDto: RateRequestResponseDto,
    @CurrentUser() user: any,
  ) {
    return this.ratesService.respondToRateRequest(id, responseDto, user.sub);
  }

  @Post('requests/:id/line-quotes')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Add line quote to rate request' })
  async addLineQuote(
    @Param('id') id: string,
    @Body() body: { lineId: string; termsJson: any; validTo: string },
    @CurrentUser() user: any,
  ) {
    return this.ratesService.addLineQuote(
      id,
      body.lineId,
      body.termsJson,
      new Date(body.validTo),
      user.sub,
    );
  }

  @Post('requests/:id/complete')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Complete rate request' })
  async completeRateRequest(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.ratesService.completeRateRequest(id, user.sub);
  }

  @Post('requests/:id/reject')
  @Roles(UserRole.PRICING)
  @ApiOperation({ summary: 'Reject rate request' })
  async rejectRateRequest(
    @Param('id') id: string,
    @Body() body: { remark: string },
    @CurrentUser() user: any,
  ) {
    return this.ratesService.rejectRateRequest(id, body.remark, user.sub);
  }

  @Get('requests/:id/processed-percentage')
  @ApiOperation({ summary: 'Get processed percentage for rate request' })
  async getProcessedPercentage(@Param('id') id: string) {
    const percentage = await this.ratesService.getProcessedPercentage(id);
    return { processedPercentage: percentage };
  }
}
