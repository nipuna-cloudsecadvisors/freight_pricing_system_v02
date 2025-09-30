import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateRODocumentDto } from './dto/create-ro-document.dto';
import { OpenERPJobDto } from './dto/open-erp-job.dto';
import { CompleteJobDto } from './dto/complete-job.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBookingRequest(createDto: CreateBookingRequestDto, raisedById: string) {
    // Validate the source and link
    if (createDto.rateSource === 'predefined') {
      const rate = await this.prisma.predefinedRate.findUnique({
        where: { id: createDto.linkId },
      });
      if (!rate) {
        throw new NotFoundException('Predefined rate not found');
      }
    } else if (createDto.rateSource === 'request') {
      const rateRequest = await this.prisma.rateRequest.findUnique({
        where: { id: createDto.linkId },
      });
      if (!rateRequest) {
        throw new NotFoundException('Rate request not found');
      }
      if (rateRequest.status !== 'COMPLETED') {
        throw new BadRequestException('Rate request must be completed before creating booking');
      }
    }

    return this.prisma.bookingRequest.create({
      data: {
        ...createDto,
        raisedById,
      },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
      },
    });
  }

  async findAll() {
    return this.prisma.bookingRequest.findMany({
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        roDocuments: true,
        jobs: {
          include: {
            openedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            completions: {
              include: {
                cseUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        roDocuments: true,
        jobs: {
          include: {
            openedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            completions: {
              include: {
                cseUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found');
    }

    return booking;
  }

  async confirm(id: string, confirmDto: ConfirmBookingDto) {
    const booking = await this.findById(id);
    
    if (booking.status !== 'PENDING') {
      throw new ForbiddenException('Can only confirm pending bookings');
    }

    // Check quote validity if from rate request
    if (booking.rateSource === 'request') {
      const rateRequest = await this.prisma.rateRequest.findUnique({
        where: { id: booking.linkId },
        include: { lineQuotes: true },
      });

      if (rateRequest) {
        const selectedQuote = rateRequest.lineQuotes.find(q => q.selected);
        if (selectedQuote && selectedQuote.validTo < new Date() && !confirmDto.overrideValidity) {
          throw new BadRequestException('Selected quote has expired. Use overrideValidity flag to proceed.');
        }
      }
    }

    return this.prisma.bookingRequest.update({
      where: { id },
      data: { 
        status: 'CONFIRMED',
        ...confirmDto,
      },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
      },
    });
  }

  async cancel(id: string, cancelDto: CancelBookingDto) {
    const booking = await this.findById(id);
    
    if (booking.status === 'CANCELLED') {
      throw new ForbiddenException('Booking is already cancelled');
    }

    return this.prisma.bookingRequest.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason: cancelDto.cancelReason,
      },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
      },
    });
  }

  async addRODocument(id: string, createDto: CreateRODocumentDto) {
    const booking = await this.findById(id);
    
    if (booking.status !== 'CONFIRMED') {
      throw new ForbiddenException('Can only add RO documents to confirmed bookings');
    }

    return this.prisma.rODocument.create({
      data: {
        ...createDto,
        bookingRequestId: id,
      },
    });
  }

  async openERPJob(id: string, openDto: OpenERPJobDto, openedById: string) {
    const booking = await this.findById(id);
    
    if (booking.status !== 'CONFIRMED') {
      throw new ForbiddenException('Can only open ERP jobs for confirmed bookings');
    }

    // Check if job already exists
    const existingJob = await this.prisma.job.findFirst({
      where: { bookingRequestId: id },
    });

    if (existingJob) {
      throw new BadRequestException('ERP job already exists for this booking');
    }

    return this.prisma.job.create({
      data: {
        ...openDto,
        bookingRequestId: id,
        openedById,
      },
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async completeJob(jobId: string, completeDto: CompleteJobDto, cseUserId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.jobCompletion.create({
      data: {
        ...completeDto,
        jobId,
        cseUserId,
      },
      include: {
        cseUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}