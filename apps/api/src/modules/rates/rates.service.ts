import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CreateRateRequestDto } from './dto/create-rate-request.dto';
import { CreatePredefinedRateDto } from './dto/create-predefined-rate.dto';
import { RateRequestResponseDto } from './dto/rate-request-response.dto';
import { RateRequestMode, RateRequestType, RateRequestStatus } from '@prisma/client';

@Injectable()
export class RatesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Predefined Rates
  async getPredefinedRates(filters: {
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
    if (filters.polId) where.polId = filters.polId;
    if (filters.podId) where.podId = filters.podId;
    if (filters.service) where.service = filters.service;
    if (filters.equipTypeId) where.equipTypeId = filters.equipTypeId;
    if (filters.status) where.status = filters.status;

    return this.prisma.predefinedRate.findMany({
      where,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPredefinedRate(createPredefinedRateDto: CreatePredefinedRateDto) {
    return this.prisma.predefinedRate.create({
      data: createPredefinedRateDto,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipType: true,
      },
    });
  }

  async requestRateUpdate(rateId: string, userId: string) {
    const rate = await this.prisma.predefinedRate.findUnique({
      where: { id: rateId },
      include: { tradeLane: true },
    });

    if (!rate) {
      throw new NotFoundException('Rate not found');
    }

    // Notify pricing team assigned to this trade lane
    await this.notificationsService.notifyPricingTeam(
      rate.tradeLaneId,
      'Rate Update Requested',
      `A salesperson has requested an update for rate: ${rate.tradeLane.name} - ${rate.polId} to ${rate.podId}`,
    );

    return { message: 'Rate update request sent to pricing team' };
  }

  // Rate Requests
  async createRateRequest(createRateRequestDto: CreateRateRequestDto, salespersonId: string) {
    // Generate reference number
    const refNo = `RR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Default POL to Colombo for sea export if not provided
    let polId = createRateRequestDto.polId;
    if (createRateRequestDto.mode === 'SEA' && !polId) {
      const colomboPort = await this.prisma.port.findFirst({
        where: { unlocode: 'LKCMB' }, // Colombo UN/LOCODE
      });
      if (colomboPort) {
        polId = colomboPort.id;
      }
    }

    const rateRequest = await this.prisma.rateRequest.create({
      data: {
        ...createRateRequestDto,
        refNo,
        polId,
        salespersonId,
      },
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipType: true,
        salesperson: true,
        customer: true,
      },
    });

    // Notify pricing team
    await this.notificationsService.notifyRole(
      'PRICING',
      'New Rate Request',
      `New rate request ${refNo} has been submitted by ${rateRequest.salesperson.name}`,
    );

    return rateRequest;
  }

  async getRateRequests(filters: {
    status?: RateRequestStatus;
    mine?: boolean;
    userId?: string;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.mine && filters.userId) where.salespersonId = filters.userId;

    return this.prisma.rateRequest.findMany({
      where,
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipType: true,
        salesperson: true,
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRateRequestById(id: string) {
    const rateRequest = await this.prisma.rateRequest.findUnique({
      where: { id },
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipType: true,
        salesperson: true,
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
          },
        },
      },
    });

    if (!rateRequest) {
      throw new NotFoundException('Rate request not found');
    }

    return rateRequest;
  }

  async respondToRateRequest(
    rateRequestId: string,
    responseDto: RateRequestResponseDto,
    pricingUserId: string,
  ) {
    const rateRequest = await this.getRateRequestById(rateRequestId);

    if (rateRequest.status !== 'PENDING') {
      throw new BadRequestException('Rate request is not pending');
    }

    // Validate vessel details if required
    if (rateRequest.vesselRequired && (!responseDto.vesselName || !responseDto.eta || !responseDto.etd)) {
      throw new BadRequestException('Vessel details are required for this request');
    }

    // Create response
    const response = await this.prisma.rateRequestResponse.create({
      data: {
        rateRequestId,
        lineNo: responseDto.lineNo,
        requestedLineId: responseDto.requestedLineId,
        requestedEquipTypeId: responseDto.requestedEquipTypeId,
        vesselName: responseDto.vesselName,
        eta: responseDto.eta,
        etd: responseDto.etd,
        fclCutoff: responseDto.fclCutoff,
        docCutoff: responseDto.docCutoff,
        validTo: responseDto.validTo,
        chargesJson: responseDto.chargesJson,
      },
    });

    // Update rate request status
    await this.prisma.rateRequest.update({
      where: { id: rateRequestId },
      data: { status: 'PROCESSING' },
    });

    // Notify salesperson
    await this.notificationsService.sendNotification({
      userId: rateRequest.salespersonId,
      channel: 'SYSTEM',
      subject: 'Rate Request Response',
      body: `Your rate request ${rateRequest.refNo} has received a response`,
    });

    return response;
  }

  async addLineQuote(
    rateRequestId: string,
    lineId: string,
    termsJson: any,
    validTo: Date,
    pricingUserId: string,
  ) {
    // Ensure only one selected quote per request
    const existingQuotes = await this.prisma.lineQuote.findMany({
      where: { rateRequestId },
    });

    if (existingQuotes.length > 0) {
      // Unselect all existing quotes
      await this.prisma.lineQuote.updateMany({
        where: { rateRequestId },
        data: { selected: false },
      });
    }

    return this.prisma.lineQuote.create({
      data: {
        rateRequestId,
        lineId,
        termsJson,
        validTo,
        selected: true,
      },
      include: {
        line: true,
      },
    });
  }

  async completeRateRequest(rateRequestId: string, pricingUserId: string) {
    const rateRequest = await this.getRateRequestById(rateRequestId);

    if (rateRequest.status !== 'PROCESSING') {
      throw new BadRequestException('Rate request is not in processing status');
    }

    const updatedRequest = await this.prisma.rateRequest.update({
      where: { id: rateRequestId },
      data: { status: 'COMPLETED' },
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipType: true,
        salesperson: true,
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
          },
        },
      },
    });

    // Notify salesperson
    await this.notificationsService.sendNotification({
      userId: rateRequest.salespersonId,
      channel: 'SYSTEM',
      subject: 'Rate Request Completed',
      body: `Your rate request ${rateRequest.refNo} has been completed`,
    });

    return updatedRequest;
  }

  async rejectRateRequest(rateRequestId: string, remark: string, pricingUserId: string) {
    const rateRequest = await this.getRateRequestById(rateRequestId);

    if (rateRequest.status !== 'PENDING' && rateRequest.status !== 'PROCESSING') {
      throw new BadRequestException('Rate request cannot be rejected');
    }

    const updatedRequest = await this.prisma.rateRequest.update({
      where: { id: rateRequestId },
      data: { 
        status: 'REJECTED',
        // Store remark in special instructions
        specialInstructions: `REJECTED: ${remark}`,
      },
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipType: true,
        salesperson: true,
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
          },
        },
      },
    });

    // Notify salesperson
    await this.notificationsService.sendNotification({
      userId: rateRequest.salespersonId,
      channel: 'SYSTEM',
      subject: 'Rate Request Rejected',
      body: `Your rate request ${rateRequest.refNo} has been rejected. Reason: ${remark}`,
    });

    return updatedRequest;
  }

  async getProcessedPercentage(rateRequestId: string) {
    const rateRequest = await this.getRateRequestById(rateRequestId);
    
    if (rateRequest.preferredLineId) {
      // If specific line preferred, check if that line has responded
      const hasResponse = rateRequest.responses.some(
        response => response.requestedLineId === rateRequest.preferredLineId
      );
      return hasResponse ? 100 : 0;
    } else {
      // If "Any" line, calculate based on total responses
      const totalResponses = rateRequest.responses.length;
      return totalResponses > 0 ? 100 : 0;
    }
  }
}
