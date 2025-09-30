import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesActivityDto, UpdateSalesActivityDto, CreateLeadDto, UpdateLeadDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  // Sales Activities
  async getSalesActivities(userId: string, userRole: UserRole) {
    const where: any = {};

    if (userRole === 'SALES') {
      where.userId = userId;
    } else if (userRole === 'SBU_HEAD') {
      // SBU Head can see activities from their SBU members
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { sbu: { include: { members: true } } }
      });
      
      if (user?.sbu) {
        const memberIds = user.sbu.members.map(m => m.id);
        where.userId = { in: memberIds };
      }
    }

    return this.prisma.salesActivity.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true }
        },
        lead: {
          select: { id: true, companyName: true }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async getSalesActivityById(id: string) {
    const activity = await this.prisma.salesActivity.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true }
        },
        lead: {
          select: { id: true, companyName: true, contact: true }
        }
      }
    });

    if (!activity) {
      throw new NotFoundException('Sales activity not found');
    }

    return activity;
  }

  async createSalesActivity(dto: CreateSalesActivityDto, userId: string) {
    return this.prisma.salesActivity.create({
      data: {
        ...dto,
        userId,
        date: new Date(dto.date),
        nextActionDate: dto.nextActionDate ? new Date(dto.nextActionDate) : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true }
        },
        lead: {
          select: { id: true, companyName: true }
        }
      }
    });
  }

  async updateSalesActivity(id: string, dto: UpdateSalesActivityDto) {
    await this.getSalesActivityById(id);

    return this.prisma.salesActivity.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        nextActionDate: dto.nextActionDate ? new Date(dto.nextActionDate) : undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true }
        },
        lead: {
          select: { id: true, companyName: true }
        }
      }
    });
  }

  async deleteSalesActivity(id: string) {
    await this.getSalesActivityById(id);
    return this.prisma.salesActivity.delete({ where: { id } });
  }

  // Leads
  async getLeads(userId: string, userRole: UserRole) {
    const where: any = {};

    if (userRole === 'SALES') {
      where.ownerId = userId;
    } else if (userRole === 'SBU_HEAD') {
      // SBU Head can see leads from their SBU members
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { sbu: { include: { members: true } } }
      });
      
      if (user?.sbu) {
        const memberIds = user.sbu.members.map(m => m.id);
        where.ownerId = { in: memberIds };
      }
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLeadById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        salesActivities: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async createLead(dto: CreateLeadDto, userId: string) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async updateLead(id: string, dto: UpdateLeadDto) {
    await this.getLeadById(id);

    return this.prisma.lead.update({
      where: { id },
      data: dto,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async deleteLead(id: string) {
    await this.getLeadById(id);
    return this.prisma.lead.delete({ where: { id } });
  }
}