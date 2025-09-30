import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getResponseTimeReport() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (r.created_at - rr.created_at)) / 3600) as avg_response_hours,
        COUNT(*) as total_responses
      FROM rate_request_responses r
      JOIN rate_requests rr ON r.rate_request_id = rr.id
      WHERE r.created_at >= NOW() - INTERVAL '30 days'
    `;

    return {
      averageResponseTimeHours: result[0]?.avg_response_hours || 0,
      totalResponses: result[0]?.total_responses || 0,
      period: '30 days'
    };
  }

  async getTopSalespersons() {
    const result = await this.prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(rr.id) as request_count,
        COUNT(CASE WHEN rr.status = 'COMPLETED' THEN 1 END) as completed_count
      FROM users u
      LEFT JOIN rate_requests rr ON u.id = rr.salesperson_id
      WHERE u.role = 'SALES'
        AND rr.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.name, u.email
      ORDER BY request_count DESC
      LIMIT 10
    `;

    return result;
  }

  async getStatusCards() {
    const [
      pendingRequests,
      processingRequests,
      completedRequests,
      rejectedRequests,
      pendingBookings,
      confirmedBookings
    ] = await Promise.all([
      this.prisma.rateRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.rateRequest.count({ where: { status: 'PROCESSING' } }),
      this.prisma.rateRequest.count({ where: { status: 'COMPLETED' } }),
      this.prisma.rateRequest.count({ where: { status: 'REJECTED' } }),
      this.prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.bookingRequest.count({ where: { status: 'CONFIRMED' } })
    ]);

    return {
      rateRequests: {
        pending: pendingRequests,
        processing: processingRequests,
        completed: completedRequests,
        rejected: rejectedRequests
      },
      bookings: {
        pending: pendingBookings,
        confirmed: confirmedBookings
      }
    };
  }

  async getDashboardData() {
    const [responseTime, topSPs, statusCards] = await Promise.all([
      this.getResponseTimeReport(),
      this.getTopSalespersons(),
      this.getStatusCards()
    ]);

    return {
      responseTime,
      topSalespersons: topSPs,
      statusCards
    };
  }
}