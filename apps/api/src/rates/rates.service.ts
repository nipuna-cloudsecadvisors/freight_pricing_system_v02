import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreatePredefinedRateDto, 
  UpdatePredefinedRateDto, 
  CreateRateRequestDto, 
  UpdateRateRequestDto,
  CreateRateRequestResponseDto,
  CreateLineQuoteDto,
  RequestRateUpdateDto,
  GetPredefinedRatesQueryDto,
  GetRateRequestsQueryDto
} from './dto';
import { UserRole, RateRequestMode } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RatesService {
  constructor(private prisma: PrismaService) {}

  // Predefined Rates
  async getPredefinedRates(query: GetPredefinedRatesQueryDto) {
    const where: any = {};

    if (query.region) {
      where.tradeLane = { region: query.region };
    }
    if (query.pol) {
      where.polId = query.pol;
    }
    if (query.pod) {
      where.podId = query.pod;
    }
    if (query.service) {
      where.service = { contains: query.service, mode: 'insensitive' };
    }
    if (query.equip) {
      where.equipTypeId = query.equip;
    }
    if (query.status) {
      where.status = query.status;
    }

    const rates = await this.prisma.predefinedRate.findMany({
      where,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipmentType: true,
        updateRequests: {
          include: {
            requester: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { tradeLane: { region: 'asc' } },
        { validTo: 'asc' }
      ]
    });

    // Add validity status
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return rates.map(rate => ({
      ...rate,
      validityStatus: rate.validTo < now ? 'expired' : 
                     rate.validTo < sevenDaysFromNow ? 'expiring' : 'active',
      hasUpdateRequests: rate.updateRequests.length > 0
    }));
  }

  async createPredefinedRate(dto: CreatePredefinedRateDto, userId: string) {
    return this.prisma.predefinedRate.create({
      data: dto,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipmentType: true,
      },
    });
  }

  async updatePredefinedRate(id: string, dto: UpdatePredefinedRateDto) {
    const rate = await this.prisma.predefinedRate.findUnique({ where: { id } });
    if (!rate) {
      throw new NotFoundException('Predefined rate not found');
    }

    return this.prisma.predefinedRate.update({
      where: { id },
      data: dto,
      include: {
        tradeLane: true,
        pol: true,
        pod: true,
        equipmentType: true,
      },
    });
  }

  async requestRateUpdate(id: string, dto: RequestRateUpdateDto, userId: string) {
    const rate = await this.prisma.predefinedRate.findUnique({
      where: { id },
      include: { tradeLane: true }
    });

    if (!rate) {
      throw new NotFoundException('Predefined rate not found');
    }

    // Create update request
    const updateRequest = await this.prisma.rateUpdateRequest.create({
      data: {
        predefinedRateId: id,
        requestedBy: userId,
        reason: dto.reason,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // TODO: Send notifications to pricing team and assigned member
    console.log(`Rate update requested for ${rate.service} by user ${userId}`);

    return updateRequest;
  }

  // Rate Requests
  async getRateRequests(query: GetRateRequestsQueryDto, userId: string, userRole: UserRole) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.mine === 'true') {
      if (userRole === UserRole.SALES) {
        where.salespersonId = userId;
      } else if (userRole === UserRole.PRICING) {
        // Show requests for trade lanes assigned to this pricing user
        const assignments = await this.prisma.pricingTeamAssignment.findMany({
          where: { userId },
          select: { tradeLaneId: true }
        });
        
        if (assignments.length > 0) {
          const tradeLaneIds = assignments.map(a => a.tradeLaneId);
          where.OR = [
            { pol: { predefinedRates: { some: { tradeLaneId: { in: tradeLaneIds } } } } },
            { pod: { predefinedRates: { some: { tradeLaneId: { in: tradeLaneIds } } } } }
          ];
        }
      }
    }

    return this.prisma.rateRequest.findMany({
      where,
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipmentType: true,
        salesperson: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true }
        },
        responses: {
          include: {
            requestedLine: true,
            requestedEquipType: true,
            responder: {
              select: { id: true, name: true }
            }
          }
        },
        lineQuotes: {
          include: {
            line: true,
            quoter: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getRateRequestById(id: string) {
    const request = await this.prisma.rateRequest.findUnique({
      where: { id },
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipmentType: true,
        salesperson: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        responses: {
          include: {
            requestedLine: true,
            requestedEquipType: true,
            responder: {
              select: { id: true, name: true }
            }
          },
          orderBy: { lineNo: 'asc' }
        },
        lineQuotes: {
          include: {
            line: true,
            quoter: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Rate request not found');
    }

    // Calculate processed percentage
    let processedPercentage = 0;
    if (request.preferredLineId) {
      // If specific line preferred, check if we have response from that line
      const hasPreferredLineResponse = request.responses.some(
        r => r.requestedLineId === request.preferredLineId
      );
      processedPercentage = hasPreferredLineResponse ? 100 : 0;
    } else {
      // If "Any" line, consider it processed if we have any responses
      processedPercentage = request.responses.length > 0 ? 100 : 0;
    }

    return {
      ...request,
      processedPercentage
    };
  }

  async createRateRequest(dto: CreateRateRequestDto, userId: string) {
    // Generate reference number
    const refNo = `RR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Default POL to Colombo for Sea Export
    let polId = dto.polId;
    if (dto.mode === RateRequestMode.SEA && !polId) {
      const colombo = await this.prisma.port.findFirst({
        where: { unlocode: 'LKCMB' }
      });
      if (colombo) {
        polId = colombo.id;
      }
    }

    // Validate equipment type requirements
    const equipmentType = await this.prisma.equipmentType.findUnique({
      where: { id: dto.equipTypeId }
    });

    if (equipmentType?.isFlatRackOpenTop && (!dto.palletCount || !dto.palletDims)) {
      throw new BadRequestException('Pallet count and dimensions are required for Flat Rack/Open Top equipment');
    }

    return this.prisma.rateRequest.create({
      data: {
        ...dto,
        refNo,
        polId: polId!,
        salespersonId: userId,
      },
      include: {
        pol: true,
        pod: true,
        preferredLine: true,
        equipmentType: true,
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async respondToRateRequest(id: string, dto: CreateRateRequestResponseDto, userId: string) {
    const request = await this.prisma.rateRequest.findUnique({
      where: { id },
      include: { responses: true }
    });

    if (!request) {
      throw new NotFoundException('Rate request not found');
    }

    if (request.status === 'COMPLETED' || request.status === 'REJECTED') {
      throw new BadRequestException('Cannot respond to completed or rejected request');
    }

    // Validate vessel details if required
    if (request.vesselRequired && (!dto.vesselName || !dto.eta || !dto.etd)) {
      throw new BadRequestException('Vessel name, ETA, and ETD are required when vessel details are requested');
    }

    // Get next line number
    const nextLineNo = Math.max(0, ...request.responses.map(r => r.lineNo)) + 1;

    const response = await this.prisma.rateRequestResponse.create({
      data: {
        ...dto,
        rateRequestId: id,
        lineNo: nextLineNo,
        respondedBy: userId,
      },
      include: {
        requestedLine: true,
        requestedEquipType: true,
        responder: {
          select: { id: true, name: true }
        }
      }
    });

    // Update request status to PROCESSING
    await this.prisma.rateRequest.update({
      where: { id },
      data: { status: 'PROCESSING' }
    });

    // TODO: Send notification to salesperson
    console.log(`Rate request ${request.refNo} responded by user ${userId}`);

    return response;
  }

  async createLineQuote(id: string, dto: CreateLineQuoteDto, userId: string) {
    const request = await this.prisma.rateRequest.findUnique({
      where: { id },
      include: { lineQuotes: true }
    });

    if (!request) {
      throw new NotFoundException('Rate request not found');
    }

    // If this quote is being selected, unselect all others
    if (dto.selected) {
      await this.prisma.lineQuote.updateMany({
        where: { rateRequestId: id },
        data: { selected: false }
      });
    }

    return this.prisma.lineQuote.create({
      data: {
        ...dto,
        rateRequestId: id,
        quotedBy: userId,
      },
      include: {
        line: true,
        quoter: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async completeRateRequest(id: string, userId: string) {
    const request = await this.prisma.rateRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new NotFoundException('Rate request not found');
    }

    return this.prisma.rateRequest.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });
  }

  async rejectRateRequest(id: string, remark: string, userId: string) {
    const request = await this.prisma.rateRequest.findUnique({
      where: { id }
    });

    if (!request) {
      throw new NotFoundException('Rate request not found');
    }

    if (!remark) {
      throw new BadRequestException('Remark is mandatory for rejection');
    }

    // TODO: Store rejection remark (add field to schema if needed)
    return this.prisma.rateRequest.update({
      where: { id },
      data: { 
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });
  }
}