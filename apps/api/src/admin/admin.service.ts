import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    const searchTerm = `%${query}%`;
    
    // Search across multiple tables
    const [
      customers,
      rateRequests,
      bookingRequests,
      users
    ] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { contactPerson: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          contactPerson: true
        },
        take: 10
      }),
      this.prisma.rateRequest.findMany({
        where: {
          OR: [
            { refNo: { contains: query, mode: 'insensitive' } },
            { hsCode: { contains: query, mode: 'insensitive' } },
            { customer: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        select: {
          id: true,
          refNo: true,
          status: true,
          customer: { select: { name: true } },
          createdAt: true
        },
        take: 10
      }),
      this.prisma.bookingRequest.findMany({
        where: {
          customer: { name: { contains: query, mode: 'insensitive' } }
        },
        select: {
          id: true,
          status: true,
          customer: { select: { name: true } },
          createdAt: true
        },
        take: 10
      }),
      this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true
        },
        take: 10
      })
    ]);

    return {
      customers: customers.map(c => ({ ...c, type: 'customer' })),
      rateRequests: rateRequests.map(r => ({ ...r, type: 'rate_request' })),
      bookingRequests: bookingRequests.map(b => ({ ...b, type: 'booking_request' })),
      users: users.map(u => ({ ...u, type: 'user' }))
    };
  }

  async getSystemStats() {
    const [
      totalUsers,
      totalCustomers,
      totalRateRequests,
      totalBookings,
      activeRates
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.customer.count({ where: { approvalStatus: 'APPROVED' } }),
      this.prisma.rateRequest.count(),
      this.prisma.bookingRequest.count(),
      this.prisma.predefinedRate.count({ where: { status: 'ACTIVE' } })
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalRateRequests,
      totalBookings,
      activeRates
    };
  }

  async getAuditLogs(limit = 50) {
    return this.prisma.auditEvent.findMany({
      include: {
        actor: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { ts: 'desc' },
      take: limit
    });
  }

  async createAuditEvent(
    actorId: string,
    entity: string,
    entityId: string,
    action: string,
    payload?: any
  ) {
    return this.prisma.auditEvent.create({
      data: {
        actorId,
        entity,
        entityId,
        action,
        payload
      }
    });
  }
}