import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MastersService {
  constructor(private prisma: PrismaService) {}

  // Ports
  async getPorts() {
    return this.prisma.port.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createPort(data: { unlocode: string; name: string; country: string }) {
    return this.prisma.port.create({ data });
  }

  // Trade Lanes
  async getTradeLanes() {
    return this.prisma.tradeLane.findMany({
      orderBy: [{ region: 'asc' }, { name: 'asc' }]
    });
  }

  async createTradeLane(data: { region: string; name: string; code: string }) {
    return this.prisma.tradeLane.create({ data });
  }

  // Equipment Types
  async getEquipmentTypes() {
    return this.prisma.equipmentType.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createEquipmentType(data: { 
    name: string; 
    isReefer?: boolean; 
    isFlatRackOpenTop?: boolean 
  }) {
    return this.prisma.equipmentType.create({ data });
  }

  // Shipping Lines
  async getShippingLines() {
    return this.prisma.shippingLine.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createShippingLine(data: { name: string; code: string }) {
    return this.prisma.shippingLine.create({ data });
  }

  // SBUs
  async getSbus() {
    return this.prisma.sbu.findMany({
      include: {
        head: {
          select: { id: true, name: true, email: true }
        },
        members: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }
}