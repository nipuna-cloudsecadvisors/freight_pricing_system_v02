import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: any, userId: string) {
    return this.prisma.salesActivity.create({
      data: {
        ...createDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        lead: true,
      },
    });
  }

  async findAll(userId?: string) {
    const where = userId ? { userId } : {};
    
    return this.prisma.salesActivity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        lead: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.salesActivity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        lead: true,
      },
    });
  }

  async update(id: string, updateDto: any) {
    return this.prisma.salesActivity.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        lead: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.salesActivity.delete({
      where: { id },
    });
  }
}