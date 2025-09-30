import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryDto, UpdateItineraryDto, CreateItineraryItemDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ItinerariesService {
  constructor(private prisma: PrismaService) {}

  async getItineraries(userId: string, userRole: UserRole) {
    const where: any = {};

    if (userRole === 'SALES' || userRole === 'CSE') {
      where.ownerUserId = userId;
    } else if (userRole === 'SBU_HEAD') {
      // SBU Head can see itineraries from their SBU members
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { sbu: { include: { members: true } } }
      });
      
      if (user?.sbu) {
        const memberIds = user.sbu.members.map(m => m.id);
        where.ownerUserId = { in: memberIds };
      }
    }

    return this.prisma.itinerary.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            customer: {
              select: { id: true, name: true }
            },
            lead: {
              select: { id: true, companyName: true }
            }
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { weekStart: 'desc' }
    });
  }

  async getItineraryById(id: string) {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            customer: {
              select: { id: true, name: true }
            },
            lead: {
              select: { id: true, companyName: true }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    return itinerary;
  }

  async createItinerary(dto: CreateItineraryDto, userId: string) {
    return this.prisma.itinerary.create({
      data: {
        ...dto,
        ownerUserId: userId,
        weekStart: new Date(dto.weekStart),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async updateItinerary(id: string, dto: UpdateItineraryDto) {
    await this.getItineraryById(id);

    return this.prisma.itinerary.update({
      where: { id },
      data: {
        ...dto,
        weekStart: dto.weekStart ? new Date(dto.weekStart) : undefined,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async submitItinerary(id: string) {
    const itinerary = await this.getItineraryById(id);

    if (itinerary.status !== 'DRAFT') {
      throw new BadRequestException('Only draft itineraries can be submitted');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      }
    });
  }

  async approveItinerary(id: string, approverId: string, note?: string) {
    const itinerary = await this.getItineraryById(id);

    if (itinerary.status !== 'SUBMITTED') {
      throw new BadRequestException('Only submitted itineraries can be approved');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approverId,
        approveNote: note,
        decidedAt: new Date(),
      }
    });
  }

  async rejectItinerary(id: string, approverId: string, note: string) {
    const itinerary = await this.getItineraryById(id);

    if (itinerary.status !== 'SUBMITTED') {
      throw new BadRequestException('Only submitted itineraries can be rejected');
    }

    if (!note) {
      throw new BadRequestException('Rejection note is required');
    }

    return this.prisma.itinerary.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approverId,
        approveNote: note,
        decidedAt: new Date(),
      }
    });
  }

  async deleteItinerary(id: string) {
    await this.getItineraryById(id);
    return this.prisma.itinerary.delete({ where: { id } });
  }

  // Itinerary Items
  async createItineraryItem(itineraryId: string, dto: CreateItineraryItemDto) {
    await this.getItineraryById(itineraryId);

    return this.prisma.itineraryItem.create({
      data: {
        ...dto,
        itineraryId,
        date: new Date(dto.date),
      },
      include: {
        customer: {
          select: { id: true, name: true }
        },
        lead: {
          select: { id: true, companyName: true }
        }
      }
    });
  }

  async updateItineraryItem(id: string, dto: Partial<CreateItineraryItemDto>) {
    const item = await this.prisma.itineraryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Itinerary item not found');
    }

    return this.prisma.itineraryItem.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        customer: {
          select: { id: true, name: true }
        },
        lead: {
          select: { id: true, companyName: true }
        }
      }
    });
  }

  async deleteItineraryItem(id: string) {
    const item = await this.prisma.itineraryItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Itinerary item not found');
    }

    return this.prisma.itineraryItem.delete({ where: { id } });
  }
}