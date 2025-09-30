import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getResponseTimeReport() {
    const rateRequests = await this.prisma.rateRequest.findMany({
      where: {
        status: { in: ['COMPLETED', 'REJECTED'] },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    const responseTimes = rateRequests.map(request => {
      const responseTime = request.updatedAt.getTime() - request.createdAt.getTime();
      return responseTime / (1000 * 60 * 60); // Convert to hours
    });

    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    return {
      averageResponseTimeHours: Math.round(averageResponseTime * 100) / 100,
      totalRequests: rateRequests.length,
      period: '30 days',
    };
  }

  async getTopSPsReport() {
    const topSPs = await this.prisma.rateRequest.groupBy({
      by: ['salespersonId'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const spsWithDetails = await Promise.all(
      topSPs.map(async (sp) => {
        const user = await this.prisma.user.findUnique({
          where: { id: sp.salespersonId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });

        return {
          ...sp,
          user,
        };
      })
    );

    return spsWithDetails;
  }

  async getStatusCardsReport() {
    const statusCounts = await this.prisma.rateRequest.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const statusCards = statusCounts.map(status => ({
      status: status.status,
      count: status._count.id,
    }));

    return statusCards;
  }

  async exportDashboardToJPEG() {
    // In a real implementation, this would generate a JPEG image
    // For now, return a placeholder
    return {
      message: 'Dashboard exported to JPEG',
      fileUrl: '/exports/dashboard.jpg',
      generatedAt: new Date(),
    };
  }
}