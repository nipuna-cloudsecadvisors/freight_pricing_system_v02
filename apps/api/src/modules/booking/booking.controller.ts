import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, BookingRequestStatus } from '@prisma/client';

@ApiTags('Booking')
@Controller('booking-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Create booking request' })
  async createBookingRequest(
    @Body() createBookingRequestDto: CreateBookingRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingService.createBookingRequest(createBookingRequestDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get booking requests' })
  async getBookingRequests(
    @Query('status') status?: BookingRequestStatus,
    @Query('customerId') customerId?: string,
    @CurrentUser() user: any,
  ) {
    return this.bookingService.getBookingRequests({
      status,
      customerId,
      raisedById: user.sub,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking request by ID' })
  async getBookingRequestById(@Param('id') id: string) {
    return this.bookingService.getBookingRequestById(id);
  }

  @Post(':id/confirm')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Confirm booking request' })
  async confirmBookingRequest(
    @Param('id') id: string,
    @Body() body: { overrideValidity?: boolean },
    @CurrentUser() user: any,
  ) {
    return this.bookingService.confirmBookingRequest(id, user.sub, body.overrideValidity);
  }

  @Post(':id/cancel')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Cancel booking request' })
  async cancelBookingRequest(
    @Param('id') id: string,
    @Body() body: { cancelReason: string },
  ) {
    return this.bookingService.cancelBookingRequest(id, body.cancelReason);
  }

  @Post(':id/ro')
  @Roles(UserRole.CSE)
  @ApiOperation({ summary: 'Add RO document' })
  async addRoDocument(
    @Param('id') id: string,
    @Body() body: { number: string; fileUrl?: string },
  ) {
    return this.bookingService.addRoDocument(id, body.number, body.fileUrl);
  }

  @Post(':id/open-erp-job')
  @Roles(UserRole.CSE)
  @ApiOperation({ summary: 'Open ERP job' })
  async openErpJob(
    @Param('id') id: string,
    @Body() body: { erpJobNo: string },
    @CurrentUser() user: any,
  ) {
    return this.bookingService.openErpJob(id, body.erpJobNo, user.sub);
  }

  @Post('jobs/:jobId/complete')
  @Roles(UserRole.CSE)
  @ApiOperation({ summary: 'Complete job' })
  async completeJob(
    @Param('jobId') jobId: string,
    @Body() body: { detailsJson: any },
    @CurrentUser() user: any,
  ) {
    return this.bookingService.completeJob(jobId, body.detailsJson, user.sub);
  }
}
