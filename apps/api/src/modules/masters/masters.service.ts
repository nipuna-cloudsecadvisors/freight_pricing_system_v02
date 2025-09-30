import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  // Ports
  async getPorts(search?: string) {
    return this.prisma.port.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { unlocode: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { name: 'asc' },
    });
  }

  async createPort(data: { unlocode: string; name: string; country: string }) {
    return this.prisma.port.create({ data });
  }

  // Trade Lanes
  async getTradeLanes(region?: string) {
    return this.prisma.tradeLane.findMany({
      where: region ? { region } : {},
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
    isReefer?: boolean; 
    isFlatRackOpenTop?: boolean; 
  }) {
    return this.prisma.equipmentType.create({ data });
  }

  // Shipping Lines
  async getShippingLines(search?: string) {
    return this.prisma.shippingLine.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { name: 'asc' },
    });
  }

  async createShippingLine(data: { name: string; code: string }) {
    return this.prisma.shippingLine.create({ data });
  }

  // SBUs
  async getSbus() {
    return this.prisma.sbu.findMany({
      include: {
        headUser: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createSbu(data: { name: string; headUserId: string }) {
    return this.prisma.sbu.create({ 
      data,
      include: {
        headUser: true,
      },
    });
  }
}
