import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const responseTimes = rateRequests.map(request => {
      if (request.responses.length > 0) {
        const responseTime = request.responses[0].createdAt.getTime() - request.createdAt.getTime();
        return responseTime / (1000 * 60 * 60); // Convert to hours
      }
      return null;
    }).filter(time => time !== null);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      averageResponseTimeHours: Math.round(averageResponseTime * 100) / 100,
      totalRequests: rateRequests.length,
      respondedRequests: responseTimes.length,
    };
  }

  async getTopSalesPersons(limit = 10) {
    const topSps = await this.prisma.rateRequest.groupBy({
      by: ['salespersonId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const salesPersonDetails = await Promise.all(
      topSps.map(async (sp) => {
        const user = await this.prisma.user.findUnique({
          where: { id: sp.salespersonId },
          select: { id: true, name: true, email: true },
        });
        return {
          ...sp,
          user,
        };
      })
    );

    return salesPersonDetails;
  }

  async getStatusCards() {
    const [pending, processing, completed, rejected] = await Promise.all([
      this.prisma.rateRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.rateRequest.count({ where: { status: 'PROCESSING' } }),
      this.prisma.rateRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.rateRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      pending,
      processing,
      completed,
      rejected,
      total: pending + processing + completed + rejected,
    };
  }

  async getBookingStatusCards() {
    const [pending, confirmed, cancelled] = await Promise.all([
      this.prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.bookingRequest.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.bookingRequest.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      pending,
      confirmed,
      cancelled,
      total: pending + confirmed + cancelled,
    };
  }

  async getCustomerApprovalStats() {
    const [pending, approved, rejected] = await Promise.all([
      this.prisma.customer.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.customer.count({ where: { approvalStatus: 'APPROVED' } }),
      this.prisma.customer.count({ where: { approvalStatus: 'REJECTED' } }),
    ]);

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }
}
