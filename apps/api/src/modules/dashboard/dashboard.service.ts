import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userRole: string, userId?: string) {
    const baseData = {
      totalRateRequests: await this.prisma.rateRequest.count(),
      totalCustomers: await this.prisma.customer.count(),
      totalBookings: await this.prisma.bookingRequest.count(),
    };

    // Role-specific data
    switch (userRole) {
      case 'SALES':
        return {
          ...baseData,
          myRateRequests: await this.prisma.rateRequest.count({
            where: { salespersonId: userId },
          }),
          myCustomers: await this.prisma.customer.count({
            where: { createdById: userId },
          }),
          myBookings: await this.prisma.bookingRequest.count({
            where: { raisedById: userId },
          }),
        };

      case 'PRICING':
        return {
          ...baseData,
          pendingRateRequests: await this.prisma.rateRequest.count({
            where: { status: 'PENDING' },
          }),
          processingRateRequests: await this.prisma.rateRequest.count({
            where: { status: 'PROCESSING' },
          }),
        };

      case 'CSE':
        return {
          ...baseData,
          pendingJobs: await this.prisma.job.count({
            where: {
              completions: { none: {} },
            },
          }),
        };

      case 'SBU_HEAD':
        return {
          ...baseData,
          pendingItineraries: await this.prisma.itinerary.count({
            where: { status: 'SUBMITTED' },
          }),
        };

      case 'ADMIN':
      case 'MGMT':
        return {
          ...baseData,
          pendingCustomerApprovals: await this.prisma.customer.count({
            where: { approvalStatus: 'PENDING' },
          }),
          totalUsers: await this.prisma.user.count(),
        };

      default:
        return baseData;
    }
  }

  async exportDashboardAsJpeg() {
    // In a real implementation, this would generate a JPEG image
    // For now, return a placeholder
    return {
      message: 'Dashboard export functionality would be implemented here',
      exportUrl: '/api/dashboard/export/jpeg',
    };
  }
}
