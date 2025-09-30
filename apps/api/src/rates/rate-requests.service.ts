import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateRequestDto } from './dto/create-rate-request.dto';
import { UpdateRateRequestDto } from './dto/update-rate-request.dto';
import { RespondToRateRequestDto } from './dto/respond-to-rate-request.dto';
import { CreateLineQuoteDto } from './dto/create-line-quote.dto';
import { CompleteRateRequestDto } from './dto/complete-rate-request.dto';
import { RejectRateRequestDto } from './dto/reject-rate-request.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RatesService } from './rates.service';

@Injectable()
export class RateRequestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private ratesService: RatesService,
  ) {}

  async create(createDto: CreateRateRequestDto, salespersonId: string) {
    // Default POL to Colombo for sea export
    if (createDto.mode === 'SEA' && !createDto.polId) {
      createDto.polId = await this.ratesService.getColomboPortId();
    }

    // Validate pallet dimensions for Flat Rack/Open Top
    if (createDto.equipTypeId) {
      const equipType = await this.prisma.equipmentType.findUnique({
        where: { id: createDto.equipTypeId },
      });

      if (equipType?.isFlatRackOpenTop && (!createDto.palletCount || !createDto.palletDims)) {
        throw new BadRequestException('Pallet count and dimensions are required for Flat Rack/Open Top equipment');
      }
    }

    const refNo = this.ratesService.generateRefNo();

    const rateRequest = await this.prisma.rateRequest.create({
      data: {
        ...createDto,
        refNo,
        salespersonId,
      },
      include: {
        pol: true,
        pod: true,
        equipType: true,
        preferredLine: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
            equipType: true,
          },
        },
      },
    });

    // Notify pricing team
    await this.notifyPricingTeam(rateRequest);

    return {
      ...rateRequest,
      processedPercentage: this.ratesService.calculateProcessedPercentage(rateRequest),
    };
  }

  async findAll(filters: {
    status?: string;
    mine?: boolean;
    salespersonId?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.mine && filters.salespersonId) {
      where.salespersonId = filters.salespersonId;
    }

    const rateRequests = await this.prisma.rateRequest.findMany({
      where,
      include: {
        pol: true,
        pod: true,
        equipType: true,
        preferredLine: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
            equipType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rateRequests.map(request => ({
      ...request,
      processedPercentage: this.ratesService.calculateProcessedPercentage(request),
    }));
  }

  async findById(id: string) {
    const rateRequest = await this.prisma.rateRequest.findUnique({
      where: { id },
      include: {
        pol: true,
        pod: true,
        equipType: true,
        preferredLine: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
            equipType: true,
          },
        },
      },
    });

    if (!rateRequest) {
      throw new NotFoundException('Rate request not found');
    }

    return {
      ...rateRequest,
      processedPercentage: this.ratesService.calculateProcessedPercentage(rateRequest),
    };
  }

  async update(id: string, updateDto: UpdateRateRequestDto) {
    const rateRequest = await this.findById(id);
    
    if (rateRequest.status !== 'PENDING') {
      throw new ForbiddenException('Can only update pending rate requests');
    }

    return this.prisma.rateRequest.update({
      where: { id },
      data: updateDto,
      include: {
        pol: true,
        pod: true,
        equipType: true,
        preferredLine: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
            equipType: true,
          },
        },
      },
    });
  }

  async respond(id: string, respondDto: RespondToRateRequestDto) {
    const rateRequest = await this.findById(id);
    
    if (rateRequest.status !== 'PENDING' && rateRequest.status !== 'PROCESSING') {
      throw new ForbiddenException('Cannot respond to this rate request');
    }

    // Validate vessel details if required
    if (rateRequest.vesselRequired) {
      if (!respondDto.vesselName || !respondDto.eta || !respondDto.etd) {
        throw new BadRequestException('Vessel name, ETA, and ETD are required when vessel details are requested');
      }
    }

    // Create response
    const response = await this.prisma.rateRequestResponse.create({
      data: {
        rateRequestId: id,
        lineNo: respondDto.lineNo,
        requestedLineId: respondDto.requestedLineId,
        requestedEquipTypeId: respondDto.requestedEquipTypeId,
        vesselName: respondDto.vesselName,
        eta: respondDto.eta,
        etd: respondDto.etd,
        fclCutoff: respondDto.fclCutoff,
        docCutoff: respondDto.docCutoff,
        validTo: respondDto.validTo,
        chargesJson: respondDto.chargesJson,
      },
    });

    // Update status to processing
    await this.prisma.rateRequest.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    // Notify salesperson
    await this.notifySalesperson(rateRequest, 'response_received');

    return response;
  }

  async createLineQuote(id: string, createDto: CreateLineQuoteDto) {
    const rateRequest = await this.findById(id);
    
    if (rateRequest.status !== 'PROCESSING') {
      throw new ForbiddenException('Can only create line quotes for processing rate requests');
    }

    // Ensure only one selected quote per request
    if (createDto.selected) {
      await this.prisma.lineQuote.updateMany({
        where: { rateRequestId: id },
        data: { selected: false },
      });
    }

    return this.prisma.lineQuote.create({
      data: {
        ...createDto,
        rateRequestId: id,
      },
      include: {
        line: true,
        equipType: true,
      },
    });
  }

  async complete(id: string, completeDto: CompleteRateRequestDto) {
    const rateRequest = await this.findById(id);
    
    if (rateRequest.status !== 'PROCESSING') {
      throw new ForbiddenException('Can only complete processing rate requests');
    }

    const updatedRequest = await this.prisma.rateRequest.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        ...completeDto,
      },
      include: {
        pol: true,
        pod: true,
        equipType: true,
        preferredLine: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
            equipType: true,
          },
        },
      },
    });

    // Notify salesperson
    await this.notifySalesperson(rateRequest, 'completed');

    return updatedRequest;
  }

  async reject(id: string, rejectDto: RejectRateRequestDto) {
    const rateRequest = await this.findById(id);
    
    if (rateRequest.status !== 'PENDING' && rateRequest.status !== 'PROCESSING') {
      throw new ForbiddenException('Cannot reject this rate request');
    }

    const updatedRequest = await this.prisma.rateRequest.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        ...rejectDto,
      },
      include: {
        pol: true,
        pod: true,
        equipType: true,
        preferredLine: true,
        salesperson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        responses: true,
        lineQuotes: {
          include: {
            line: true,
            equipType: true,
          },
        },
      },
    });

    // Notify salesperson
    await this.notifySalesperson(rateRequest, 'rejected');

    return updatedRequest;
  }

  private async notifyPricingTeam(rateRequest: any) {
    // Get pricing team members for the trade lane
    const tradeLane = await this.prisma.tradeLane.findUnique({
      where: { id: rateRequest.tradeLaneId },
    });

    if (!tradeLane) return;

    const pricingMembers = await this.prisma.pricingTeamAssignment.findMany({
      where: { tradeLaneId: tradeLane.id },
      include: { user: true },
    });

    // Notify all pricing team members
    const notificationPromises = pricingMembers.map(member =>
      this.notificationsService.create({
        userId: member.userId,
        channel: 'SYSTEM',
        subject: 'New Rate Request',
        body: `New rate request ${rateRequest.refNo} from ${rateRequest.salesperson.name}`,
        meta: {
          type: 'new_rate_request',
          rateRequestId: rateRequest.id,
          refNo: rateRequest.refNo,
        },
      })
    );

    await Promise.all(notificationPromises);
  }

  private async notifySalesperson(rateRequest: any, type: string) {
    const messages = {
      response_received: {
        subject: 'Rate Request Response Received',
        body: `Response received for rate request ${rateRequest.refNo}`,
      },
      completed: {
        subject: 'Rate Request Completed',
        body: `Rate request ${rateRequest.refNo} has been completed`,
      },
      rejected: {
        subject: 'Rate Request Rejected',
        body: `Rate request ${rateRequest.refNo} has been rejected`,
      },
    };

    const message = messages[type];
    if (!message) return;

    await this.notificationsService.create({
      userId: rateRequest.salespersonId,
      channel: 'SYSTEM',
      subject: message.subject,
      body: message.body,
      meta: {
        type,
        rateRequestId: rateRequest.id,
        refNo: rateRequest.refNo,
      },
    });
  }
}