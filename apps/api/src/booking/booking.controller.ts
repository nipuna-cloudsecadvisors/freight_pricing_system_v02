import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { BookingService } from './booking.service';
import { CreateBookingRequestDto, CreateRoDocumentDto, CreateJobDto, CompleteJobDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Booking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('requests')
  @ApiOperation({ summary: 'Get booking requests' })
  @ApiResponse({ status: 200, description: 'Booking requests retrieved successfully' })
  getBookingRequests(@CurrentUser() user: any) {
    return this.bookingService.getBookingRequests(user.id, user.role);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get booking request by ID' })
  @ApiResponse({ status: 200, description: 'Booking request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking request not found' })
  getBookingRequest(@Param('id') id: string) {
    return this.bookingService.getBookingRequestById(id);
  }

  @Post('requests')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Create booking request' })
  @ApiResponse({ status: 201, description: 'Booking request created successfully' })
  createBookingRequest(
    @Body() dto: CreateBookingRequestDto,
    @CurrentUser() user: any
  ) {
    return this.bookingService.createBookingRequest(dto, user.id);
  }

  @Post('requests/:id/confirm')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Confirm booking request' })
  @ApiResponse({ status: 200, description: 'Booking request confirmed successfully' })
  confirmBookingRequest(
    @Param('id') id: string,
    @Query('override') override?: string
  ) {
    return this.bookingService.confirmBookingRequest(id, override === 'true');
  }

  @Post('requests/:id/cancel')
  @Roles(UserRole.SALES)
  @ApiOperation({ summary: 'Cancel booking request' })
  @ApiResponse({ status: 200, description: 'Booking request cancelled successfully' })
  cancelBookingRequest(
    @Param('id') id: string,
    @Body() body: { cancelReason: string }
  ) {
    return this.bookingService.cancelBookingRequest(id, body.cancelReason);
  }

  @Post('requests/:id/ro')
  @Roles(UserRole.CSE)
  @ApiOperation({ summary: 'Add RO document to booking request' })
  @ApiResponse({ status: 201, description: 'RO document added successfully' })
  addRoDocument(
    @Param('id') id: string,
    @Body() dto: CreateRoDocumentDto
  ) {
    return this.bookingService.addRoDocument(id, dto);
  }

  @Post('requests/:id/open-erp-job')
  @Roles(UserRole.CSE)
  @ApiOperation({ summary: 'Open ERP job for booking request' })
  @ApiResponse({ status: 201, description: 'ERP job opened successfully' })
  openErpJob(
    @Param('id') id: string,
    @Body() dto: CreateJobDto,
    @CurrentUser() user: any
  ) {
    return this.bookingService.openErpJob(id, dto, user.id);
  }

  @Post('jobs/:id/complete')
  @Roles(UserRole.CSE)
  @ApiOperation({ summary: 'Complete job with details' })
  @ApiResponse({ status: 201, description: 'Job completed successfully' })
  completeJob(
    @Param('id') id: string,
    @Body() dto: CompleteJobDto,
    @CurrentUser() user: any
  ) {
    return this.bookingService.completeJob(id, dto, user.id);
  }
}