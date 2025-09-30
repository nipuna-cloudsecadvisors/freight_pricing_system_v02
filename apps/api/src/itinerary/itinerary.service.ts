import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItineraryService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: any, ownerId: string) {
    return this.prisma.itinerary.create({
      data: {
        ...createDto,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });
  }

  async findAll(ownerId?: string) {
    const where = ownerId ? { ownerId } : {};
    
    return this.prisma.itinerary.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

  async findById(id: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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

  async submit(id: string, ownerId: string) {
    const itinerary = await this.findById(id);
    
    if (itinerary.ownerId !== ownerId) {
      throw new ForbiddenException('Can only submit your own itineraries');
    }

    if (itinerary.status !== 'DRAFT') {
      throw new ForbiddenException('Can only submit draft itineraries');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });
  }

  async approve(id: string, approveDto: { status: 'APPROVED' | 'REJECTED'; note?: string }, approverId: string) {
    const itinerary = await this.findById(id);
    
    if (itinerary.status !== 'SUBMITTED') {
      throw new ForbiddenException('Can only approve submitted itineraries');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: {
        status: approveDto.status,
        approverId,
        approveNote: approveDto.note,
        decidedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            customer: true,
            lead: true,
          },
        },
      },
    });
  }

  async addItem(itineraryId: string, createDto: any) {
    return this.prisma.itineraryItem.create({
      data: {
        ...createDto,
        itineraryId,
      },
      include: {
        customer: true,
        lead: true,
      },
    });
  }

  async updateItem(itemId: string, updateDto: any) {
    return this.prisma.itineraryItem.update({
      where: { id: itemId },
      data: updateDto,
      include: {
        customer: true,
        lead: true,
      },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.itineraryItem.delete({
      where: { id: itemId },
    });
  }
}