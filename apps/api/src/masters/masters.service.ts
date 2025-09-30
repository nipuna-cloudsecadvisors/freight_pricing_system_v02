import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  // Ports
  async getPorts() {
    return this.prisma.port.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createPort(data: { unlocode: string; name: string; country: string }) {
    return this.prisma.port.create({ data });
  }

  // Trade Lanes
  async getTradeLanes() {
    return this.prisma.tradeLane.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createTradeLane(data: { region: string; name: string; code: string }) {
    return this.prisma.tradeLane.create({ data });
  }

  // Equipment Types
  async getEquipmentTypes() {
    return this.prisma.equipmentType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createEquipmentType(data: { 
    name: string; 
    isReefer: boolean; 
    isFlatRackOpenTop: boolean 
  }) {
    return this.prisma.equipmentType.create({ data });
  }

  // Shipping Lines
  async getShippingLines() {
    return this.prisma.shippingLine.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createShippingLine(data: { name: string; code: string }) {
    return this.prisma.shippingLine.create({ data });
  }

  // SBUs
  async getSBUs() {
    return this.prisma.sBU.findMany({
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createSBU(data: { name: string; headUserId: string }) {
    return this.prisma.sBU.create({ 
      data,
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Pricing Team Assignments
  async getPricingAssignments() {
    return this.prisma.pricingTeamAssignment.findMany({
      include: {
        tradeLane: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async createPricingAssignment(data: { tradeLaneId: string; userId: string }) {
    return this.prisma.pricingTeamAssignment.create({
      data,
      include: {
        tradeLane: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deletePricingAssignment(id: string) {
    return this.prisma.pricingTeamAssignment.delete({
      where: { id },
    });
  }
}