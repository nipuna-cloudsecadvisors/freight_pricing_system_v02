import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredefinedRateDto } from './dto/create-predefined-rate.dto';
import { UpdatePredefinedRateDto } from './dto/update-predefined-rate.dto';
import { RequestRateUpdateDto } from './dto/request-rate-update.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PredefinedRatesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(filters: {
    region?: string;
    polId?: string;
    podId?: string;
    service?: string;
    equipTypeId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.region) {
      where.tradeLane = { region: filters.region };
    }
    if (filters.polId) {
      where.polId = filters.polId;
    }
    if (filters.podId) {
      where.podId = filters.podId;
    }
    if (filters.service) {
      where.service = { contains: filters.service, mode: 'insensitive' };
    }
    if (filters.equipTypeId) {
      where.equipTypeId = filters.equipTypeId;
    }
    if (filters.status) {
      if (filters.status === 'expired') {
        where.validTo = { lt: new Date() };
      } else if (filters.status === 'expiring') {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        where.validTo = { 
          gte: new Date(),
          lte: sevenDaysFromNow 
        };
      } else if (filters.status === 'active') {
        where.validTo = { gte: new Date() };
      }
    }

    const rates = await this.prisma.predefinedRate.findMany({
      where,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipType: true,
      },
      orderBy: [
        { tradeLane: { region: 'asc' } },
        { tradeLane: { name: 'asc' } },
        { validTo: 'desc' },
      ],
    });

    // Add status information
    return rates.map(rate => ({
      ...rate,
      statusInfo: this.getRateStatusInfo(rate.validFrom, rate.validTo),
    }));
  }

  async findById(id: string) {
    const rate = await this.prisma.predefinedRate.findUnique({
      where: { id },
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipType: true,
      },
    });

    if (!rate) {
      throw new NotFoundException('Predefined rate not found');
    }

    return {
      ...rate,
      statusInfo: this.getRateStatusInfo(rate.validFrom, rate.validTo),
    };
  }

  async create(createDto: CreatePredefinedRateDto) {
    return this.prisma.predefinedRate.create({
      data: createDto,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipType: true,
      },
    });
  }

  async update(id: string, updateDto: UpdatePredefinedRateDto) {
    const rate = await this.findById(id);
    
    return this.prisma.predefinedRate.update({
      where: { id },
      data: updateDto,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipType: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.predefinedRate.delete({
      where: { id },
    });
  }

  async requestUpdate(id: string, requestDto: RequestRateUpdateDto, requestedById: string) {
    const rate = await this.findById(id);
    
    if (rate.statusInfo.status !== 'expired') {
      throw new ForbiddenException('Can only request updates for expired rates');
    }

    // Get all pricing team members for this trade lane
    const pricingMembers = await this.prisma.pricingTeamAssignment.findMany({
      where: { tradeLaneId: rate.tradeLaneId },
      include: { user: true },
    });

    // Notify all pricing team members
    const notificationPromises = pricingMembers.map(member =>
      this.notificationsService.create({
        userId: member.userId,
        channel: 'SYSTEM',
        subject: 'Rate Update Request',
        body: `Rate update requested for ${rate.tradeLane.name} - ${rate.pol.name} to ${rate.pod.name}`,
        meta: {
          type: 'rate_update_request',
          rateId: id,
          requestedBy: requestedById,
          reason: requestDto.reason,
        },
      })
    );

    // Also send email and SMS notifications
    const emailPromises = pricingMembers.map(member =>
      this.notificationsService.create({
        userId: member.userId,
        channel: 'EMAIL',
        subject: 'Rate Update Request - Action Required',
        body: `A rate update has been requested for ${rate.tradeLane.name} - ${rate.pol.name} to ${rate.pod.name}. Reason: ${requestDto.reason}`,
        meta: {
          type: 'rate_update_request',
          rateId: id,
          requestedBy: requestedById,
        },
      })
    );

    const smsPromises = pricingMembers.map(member =>
      this.notificationsService.create({
        userId: member.userId,
        channel: 'SMS',
        subject: 'Rate Update Request',
        body: `Rate update requested for ${rate.tradeLane.name}. Check system for details.`,
        meta: {
          type: 'rate_update_request',
          rateId: id,
        },
      })
    );

    await Promise.all([
      ...notificationPromises,
      ...emailPromises,
      ...smsPromises,
    ]);

    return { message: 'Rate update request sent to pricing team' };
  }

  private getRateStatusInfo(validFrom: Date, validTo: Date) {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    if (validTo < now) {
      return { status: 'expired', color: 'red' };
    }
    
    if (validTo <= sevenDaysFromNow) {
      return { status: 'expiring', color: 'yellow' };
    }
    
    return { status: 'active', color: 'green' };
  }
}