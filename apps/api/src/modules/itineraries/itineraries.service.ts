import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { ItineraryType, ItineraryStatus } from '@prisma/client';

@Injectable()
export class ItinerariesService {
  constructor(private prisma: PrismaService) {}

  async createItinerary(createItineraryDto: CreateItineraryDto, ownerId: string) {
    return this.prisma.itinerary.create({
      data: {
        ...createItineraryDto,
        ownerId,
      },
      include: {
        owner: true,
        approver: true,
        items: true,
      },
    });
  }

  async getItineraries(filters: {
    ownerId?: string;
    type?: ItineraryType;
    status?: ItineraryStatus;
    weekStart?: Date;
  }) {
    const where: any = {};

    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.weekStart) where.weekStart = filters.weekStart;

    return this.prisma.itinerary.findMany({
      where,
      include: {
        owner: true,
        approver: true,
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
      orderBy: { weekStart: 'desc' },
    });
  }

  async getItineraryById(id: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        owner: true,
        approver: true,
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    return itinerary;
  }

  async submitItinerary(id: string, ownerId: string) {
    const itinerary = await this.getItineraryById(id);

    if (itinerary.ownerId !== ownerId) {
      throw new BadRequestException('You can only submit your own itineraries');
    }

    if (itinerary.status !== 'DRAFT') {
      throw new BadRequestException('Only draft itineraries can be submitted');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: { 
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        owner: true,
        approver: true,
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });
  }

  async approveItinerary(id: string, approverId: string, approveNote?: string) {
    const itinerary = await this.getItineraryById(id);

    if (itinerary.status !== 'SUBMITTED') {
      throw new BadRequestException('Only submitted itineraries can be approved');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: { 
        status: 'APPROVED',
        approverId,
        approveNote,
        decidedAt: new Date(),
      },
      include: {
        owner: true,
        approver: true,
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });
  }

  async rejectItinerary(id: string, approverId: string, approveNote: string) {
    const itinerary = await this.getItineraryById(id);

    if (itinerary.status !== 'SUBMITTED') {
      throw new BadRequestException('Only submitted itineraries can be rejected');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        approverId,
        approveNote,
        decidedAt: new Date(),
      },
      include: {
        owner: true,
        approver: true,
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });
  }

  async addItineraryItem(itineraryId: string, createItineraryItemDto: CreateItineraryItemDto) {
    return this.prisma.itineraryItem.create({
      data: {
        ...createItineraryItemDto,
        itineraryId,
      },
      include: {
        customer: true,
        lead: true,
      },
    });
  }

  async updateItineraryItem(itemId: string, updateData: Partial<CreateItineraryItemDto>) {
    return this.prisma.itineraryItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        customer: true,
        lead: true,
      },
    });
  }

  async deleteItineraryItem(itemId: string) {
    return this.prisma.itineraryItem.delete({
      where: { id: itemId },
    });
  }
}
