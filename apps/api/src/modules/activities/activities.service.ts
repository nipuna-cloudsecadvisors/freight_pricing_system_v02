import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSalesActivityDto } from './dto/create-sales-activity.dto';
import { SalesActivityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async createSalesActivity(createSalesActivityDto: CreateSalesActivityDto, userId: string) {
    return this.prisma.salesActivity.create({
      data: {
        ...createSalesActivityDto,
        userId,
      },
      include: {
        user: true,
        customer: true,
        lead: true,
      },
    });
  }

  async getSalesActivities(filters: {
    userId?: string;
    customerId?: string;
    leadId?: string;
    type?: SalesActivityType;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.leadId) where.leadId = filters.leadId;
    if (filters.type) where.type = filters.type;
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = filters.dateFrom;
      if (filters.dateTo) where.date.lte = filters.dateTo;
    }

    return this.prisma.salesActivity.findMany({
      where,
      include: {
        user: true,
        customer: true,
        lead: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSalesActivityById(id: string) {
    return this.prisma.salesActivity.findUnique({
      where: { id },
      include: {
        user: true,
        customer: true,
        lead: true,
      },
    });
  }

  async updateSalesActivity(id: string, updateData: Partial<CreateSalesActivityDto>) {
    return this.prisma.salesActivity.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        customer: true,
        lead: true,
      },
    });
  }

  async deleteSalesActivity(id: string) {
    return this.prisma.salesActivity.delete({
      where: { id },
    });
  }

  async getActivitiesByUser(userId: string, limit = 50) {
    return this.prisma.salesActivity.findMany({
      where: { userId },
      include: {
        customer: true,
        lead: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }
}
