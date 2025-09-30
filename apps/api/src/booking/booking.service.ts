import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingRequestDto, CreateRoDocumentDto, CreateJobDto, CompleteJobDto } from './dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async getBookingRequests(userId: string, userRole: string) {
    const where: any = {};

    // Filter based on user role
    if (userRole === 'SALES') {
      where.raisedByUserId = userId;
    }

    return this.prisma.bookingRequest.findMany({
      where,
      include: {
        raisedBy: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true }
        },
        predefinedRate: {
          include: {
            pol: true,
            pod: true,
            equipmentType: true,
            tradeLane: true
          }
        },
        rateRequest: {
          include: {
            pol: true,
            pod: true,
            equipmentType: true
          }
        },
        lineQuote: {
          include: {
            line: true,
            rateRequest: {
              include: {
                pol: true,
                pod: true,
                equipmentType: true
              }
            }
          }
        },
        roDocuments: true,
        jobs: {
          include: {
            openedBy: {
              select: { id: true, name: true }
            },
            completions: {
              include: {
                cse: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBookingRequestById(id: string) {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        raisedBy: {
          select: { id: true, name: true, email: true }
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        predefinedRate: {
          include: {
            pol: true,
            pod: true,
            equipmentType: true,
            tradeLane: true
          }
        },
        rateRequest: {
          include: {
            pol: true,
            pod: true,
            equipmentType: true,
            salesperson: {
              select: { id: true, name: true }
            }
          }
        },
        lineQuote: {
          include: {
            line: true,
            rateRequest: {
              include: {
                pol: true,
                pod: true,
                equipmentType: true
              }
            }
          }
        },
        roDocuments: true,
        jobs: {
          include: {
            openedBy: {
              select: { id: true, name: true }
            },
            completions: {
              include: {
                cse: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found');
    }

    return booking;
  }

  async createBookingRequest(dto: CreateBookingRequestDto, userId: string) {
    // Validate the rate source
    if (dto.rateSource === 'predefined') {
      const rate = await this.prisma.predefinedRate.findUnique({
        where: { id: dto.linkId }
      });
      if (!rate) {
        throw new BadRequestException('Predefined rate not found');
      }
      
      return this.prisma.bookingRequest.create({
        data: {
          raisedByUserId: userId,
          customerId: dto.customerId,
          rateSource: dto.rateSource,
          linkId: dto.linkId,
          predefinedRateId: dto.linkId,
        },
        include: {
          predefinedRate: {
            include: {
              pol: true,
              pod: true,
              equipmentType: true
            }
          },
          customer: {
            select: { id: true, name: true }
          }
        }
      });
    } else if (dto.rateSource === 'request') {
      const lineQuote = await this.prisma.lineQuote.findUnique({
        where: { id: dto.linkId },
        include: { rateRequest: true }
      });
      if (!lineQuote) {
        throw new BadRequestException('Line quote not found');
      }

      return this.prisma.bookingRequest.create({
        data: {
          raisedByUserId: userId,
          customerId: dto.customerId,
          rateSource: dto.rateSource,
          linkId: dto.linkId,
          rateRequestId: lineQuote.rateRequestId,
          lineQuoteId: dto.linkId,
        },
        include: {
          lineQuote: {
            include: {
              line: true,
              rateRequest: {
                include: {
                  pol: true,
                  pod: true,
                  equipmentType: true
                }
              }
            }
          },
          customer: {
            select: { id: true, name: true }
          }
        }
      });
    }

    throw new BadRequestException('Invalid rate source');
  }

  async confirmBookingRequest(id: string, overrideExpiry = false) {
    const booking = await this.getBookingRequestById(id);

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking request is not in pending status');
    }

    // Check validity if not overriding
    if (!overrideExpiry) {
      const now = new Date();
      let validTo: Date | null = null;

      if (booking.predefinedRate) {
        validTo = booking.predefinedRate.validTo;
      } else if (booking.lineQuote) {
        validTo = booking.lineQuote.validTo;
      }

      if (validTo && validTo < now) {
        throw new BadRequestException('Rate has expired. Use override flag to proceed.');
      }
    }

    return this.prisma.bookingRequest.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });
  }

  async cancelBookingRequest(id: string, cancelReason: string) {
    if (!cancelReason) {
      throw new BadRequestException('Cancel reason is required');
    }

    const booking = await this.getBookingRequestById(id);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking request is already cancelled');
    }

    return this.prisma.bookingRequest.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason 
      }
    });
  }

  async addRoDocument(id: string, dto: CreateRoDocumentDto) {
    await this.getBookingRequestById(id);

    return this.prisma.roDocument.create({
      data: {
        bookingRequestId: id,
        number: dto.number,
        fileUrl: dto.fileUrl,
        receivedAt: new Date(dto.receivedAt),
      }
    });
  }

  async openErpJob(id: string, dto: CreateJobDto, userId: string) {
    const booking = await this.getBookingRequestById(id);

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking must be confirmed before opening ERP job');
    }

    return this.prisma.job.create({
      data: {
        bookingRequestId: id,
        erpJobNo: dto.erpJobNo,
        openedByUserId: userId,
        openedAt: new Date(),
      },
      include: {
        openedBy: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async completeJob(jobId: string, dto: CompleteJobDto, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.jobCompletion.create({
      data: {
        jobId,
        cseUserId: userId,
        detailsJson: dto.detailsJson,
        completedAt: new Date(),
      },
      include: {
        cse: {
          select: { id: true, name: true }
        }
      }
    });
  }
}