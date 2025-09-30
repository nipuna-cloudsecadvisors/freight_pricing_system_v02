import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, ItineraryType, ItineraryStatus } from '@prisma/client';

@ApiTags('Itineraries')
@Controller('itineraries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post()
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Create itinerary' })
  async createItinerary(
    @Body() createItineraryDto: CreateItineraryDto,
    @CurrentUser() user: any,
  ) {
    return this.itinerariesService.createItinerary(createItineraryDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get itineraries' })
  async getItineraries(
    @Query('type') type?: ItineraryType,
    @Query('status') status?: ItineraryStatus,
    @Query('weekStart') weekStart?: string,
    @CurrentUser() user: any,
  ) {
    return this.itinerariesService.getItineraries({
      ownerId: user.sub,
      type,
      status,
      weekStart: weekStart ? new Date(weekStart) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get itinerary by ID' })
  async getItineraryById(@Param('id') id: string) {
    return this.itinerariesService.getItineraryById(id);
  }

  @Post(':id/submit')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Submit itinerary for approval' })
  async submitItinerary(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.itinerariesService.submitItinerary(id, user.sub);
  }

  @Post(':id/approve')
  @Roles(UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Approve itinerary' })
  async approveItinerary(
    @Param('id') id: string,
    @Body() body: { approveNote?: string },
    @CurrentUser() user: any,
  ) {
    return this.itinerariesService.approveItinerary(id, user.sub, body.approveNote);
  }

  @Post(':id/reject')
  @Roles(UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Reject itinerary' })
  async rejectItinerary(
    @Param('id') id: string,
    @Body() body: { approveNote: string },
    @CurrentUser() user: any,
  ) {
    return this.itinerariesService.rejectItinerary(id, user.sub, body.approveNote);
  }

  @Post(':id/items')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Add itinerary item' })
  async addItineraryItem(
    @Param('id') id: string,
    @Body() createItineraryItemDto: CreateItineraryItemDto,
  ) {
    return this.itinerariesService.addItineraryItem(id, createItineraryItemDto);
  }

  @Patch('items/:itemId')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Update itinerary item' })
  async updateItineraryItem(
    @Param('itemId') itemId: string,
    @Body() updateData: Partial<CreateItineraryItemDto>,
  ) {
    return this.itinerariesService.updateItineraryItem(itemId, updateData);
  }

  @Delete('items/:itemId')
  @Roles(UserRole.SALES, UserRole.CSE)
  @ApiOperation({ summary: 'Delete itinerary item' })
  async deleteItineraryItem(@Param('itemId') itemId: string) {
    return this.itinerariesService.deleteItineraryItem(itemId);
  }
}
