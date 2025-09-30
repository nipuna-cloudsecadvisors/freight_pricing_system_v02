import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateRODocumentDto } from './dto/create-ro-document.dto';
import { OpenERPJobDto } from './dto/open-erp-job.dto';
import { CompleteJobDto } from './dto/complete-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Booking')
@Controller('booking-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles('SALES')
  @ApiOperation({ summary: 'Create a new booking request' })
  @ApiResponse({ status: 201, description: 'Booking request created successfully' })
  create(@Body() createDto: CreateBookingRequestDto, @Request() req) {
    return this.bookingService.createBookingRequest(createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all booking requests' })
  @ApiResponse({ status: 200, description: 'Booking requests retrieved successfully' })
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking request by ID' })
  @ApiResponse({ status: 200, description: 'Booking request retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Post(':id/confirm')
  @Roles('SALES')
  @ApiOperation({ summary: 'Confirm booking request' })
  @ApiResponse({ status: 200, description: 'Booking request confirmed successfully' })
  confirm(@Param('id') id: string, @Body() confirmDto: ConfirmBookingDto) {
    return this.bookingService.confirm(id, confirmDto);
  }

  @Post(':id/cancel')
  @Roles('SALES')
  @ApiOperation({ summary: 'Cancel booking request' })
  @ApiResponse({ status: 200, description: 'Booking request cancelled successfully' })
  cancel(@Param('id') id: string, @Body() cancelDto: CancelBookingDto) {
    return this.bookingService.cancel(id, cancelDto);
  }

  @Post(':id/ro')
  @Roles('CSE')
  @ApiOperation({ summary: 'Add RO document to booking' })
  @ApiResponse({ status: 201, description: 'RO document added successfully' })
  addRODocument(@Param('id') id: string, @Body() createDto: CreateRODocumentDto) {
    return this.bookingService.addRODocument(id, createDto);
  }

  @Post(':id/open-erp-job')
  @Roles('CSE')
  @ApiOperation({ summary: 'Open ERP job for booking' })
  @ApiResponse({ status: 201, description: 'ERP job opened successfully' })
  openERPJob(@Param('id') id: string, @Body() openDto: OpenERPJobDto, @Request() req) {
    return this.bookingService.openERPJob(id, openDto, req.user.id);
  }

  @Post('jobs/:jobId/complete')
  @Roles('CSE')
  @ApiOperation({ summary: 'Complete job with details' })
  @ApiResponse({ status: 201, description: 'Job completed successfully' })
  completeJob(@Param('jobId') jobId: string, @Body() completeDto: CompleteJobDto, @Request() req) {
    return this.bookingService.completeJob(jobId, completeDto, req.user.id);
  }
}