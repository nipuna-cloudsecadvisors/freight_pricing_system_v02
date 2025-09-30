import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto, UpdateItineraryDto, CreateItineraryItemDto, ApproveRejectDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Itineraries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Get()
  @Roles(UserRole.SALES, UserRole.CSE, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get itineraries' })
  @ApiResponse({ status: 200, description: 'Itineraries retrieved successfully' })
  getItineraries(@CurrentUser() user: any) {
    return this.itinerariesService.getItineraries(user.id, user.role);
  }

  @Get(':id')
  @Roles(UserRole.SALES, UserRole.CSE, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get itinerary by ID' })
  @ApiResponse({ status: 200, description: 'Itinerary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Itinerary not found' })
  getItinerary(@Param('id') id: string) {
    return this.itinerariesService.getItineraryById(id);
  }

  @Post()
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Create itinerary' })
  @ApiResponse({ status: 201, description: 'Itinerary created successfully' })
  createItinerary(@Body() dto: CreateItineraryDto, @CurrentUser() user: any) {
    return this.itinerariesService.createItinerary(dto, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Update itinerary' })
  @ApiResponse({ status: 200, description: 'Itinerary updated successfully' })
  updateItinerary(@Param('id') id: string, @Body() dto: UpdateItineraryDto) {
    return this.itinerariesService.updateItinerary(id, dto);
  }

  @Post(':id/submit')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Submit itinerary for approval' })
  @ApiResponse({ status: 200, description: 'Itinerary submitted successfully' })
  submitItinerary(@Param('id') id: string) {
    return this.itinerariesService.submitItinerary(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Approve itinerary' })
  @ApiResponse({ status: 200, description: 'Itinerary approved successfully' })
  approveItinerary(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() user: any
  ) {
    return this.itinerariesService.approveItinerary(id, user.id, dto.note);
  }

  @Post(':id/reject')
  @Roles(UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Reject itinerary' })
  @ApiResponse({ status: 200, description: 'Itinerary rejected successfully' })
  rejectItinerary(
    @Param('id') id: string,
    @Body() dto: ApproveRejectDto,
    @CurrentUser() user: any
  ) {
    return this.itinerariesService.rejectItinerary(id, user.id, dto.note!);
  }

  @Delete(':id')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Delete itinerary' })
  @ApiResponse({ status: 200, description: 'Itinerary deleted successfully' })
  deleteItinerary(@Param('id') id: string) {
    return this.itinerariesService.deleteItinerary(id);
  }

  // Itinerary Items
  @Post(':id/items')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Add item to itinerary' })
  @ApiResponse({ status: 201, description: 'Itinerary item created successfully' })
  createItineraryItem(
    @Param('id') itineraryId: string,
    @Body() dto: CreateItineraryItemDto
  ) {
    return this.itinerariesService.createItineraryItem(itineraryId, dto);
  }

  @Patch('items/:id')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Update itinerary item' })
  @ApiResponse({ status: 200, description: 'Itinerary item updated successfully' })
  updateItineraryItem(
    @Param('id') id: string,
    @Body() dto: Partial<CreateItineraryItemDto>
  ) {
    return this.itinerariesService.updateItineraryItem(id, dto);
  }

  @Delete('items/:id')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Delete itinerary item' })
  @ApiResponse({ status: 200, description: 'Itinerary item deleted successfully' })
  deleteItineraryItem(@Param('id') id: string) {
    return this.itinerariesService.deleteItineraryItem(id);
  }
}