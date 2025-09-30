import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingRequestDto } from './dto/create-booking-request.dto';
import { BookingRequestStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async createBookingRequest(createBookingRequestDto: CreateBookingRequestDto, raisedById: string) {
    return this.prisma.bookingRequest.create({
      data: {
        ...createBookingRequestDto,
        raisedById,
      },
      include: {
        raisedBy: true,
        customer: true,
        roDocs: true,
        jobs: true,
      },
    });
  }

  async getBookingRequests(filters: {
    status?: BookingRequestStatus;
    customerId?: string;
    raisedById?: string;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.raisedById) where.raisedById = filters.raisedById;

    return this.prisma.bookingRequest.findMany({
      where,
      include: {
        raisedBy: true,
        customer: true,
        roDocs: true,
        jobs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingRequestById(id: string) {
    const bookingRequest = await this.prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        raisedBy: true,
        customer: true,
        roDocs: true,
        jobs: {
          include: {
            completions: {
              include: {
                cseUser: true,
              },
            },
          },
        },
      },
    });

    if (!bookingRequest) {
      throw new NotFoundException('Booking request not found');
    }

    return bookingRequest;
  }

  async confirmBookingRequest(id: string, userId: string, overrideValidity = false) {
    const bookingRequest = await this.getBookingRequestById(id);

    if (bookingRequest.status !== 'PENDING') {
      throw new BadRequestException('Booking request is not pending');
    }

    // Check quote validity if not overriding
    if (!overrideValidity) {
      // TODO: Implement validity check based on rate source
    }

    return this.prisma.bookingRequest.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        raisedBy: true,
        customer: true,
        roDocs: true,
        jobs: true,
      },
    });
  }

  async cancelBookingRequest(id: string, cancelReason: string) {
    const bookingRequest = await this.getBookingRequestById(id);

    if (bookingRequest.status === 'CANCELLED') {
      throw new BadRequestException('Booking request is already cancelled');
    }

    return this.prisma.bookingRequest.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason,
      },
      include: {
        raisedBy: true,
        customer: true,
        roDocs: true,
        jobs: true,
      },
    });
  }

  async addRoDocument(bookingRequestId: string, number: string, fileUrl?: string) {
    return this.prisma.roDocument.create({
      data: {
        bookingRequestId,
        number,
        fileUrl,
      },
    });
  }

  async openErpJob(bookingRequestId: string, erpJobNo: string, openedById: string) {
    return this.prisma.job.create({
      data: {
        bookingRequestId,
        erpJobNo,
        openedById,
      },
      include: {
        openedBy: true,
        bookingRequest: true,
      },
    });
  }

  async completeJob(jobId: string, detailsJson: any, cseUserId: string) {
    return this.prisma.jobCompletion.create({
      data: {
        jobId,
        cseUserId,
        detailsJson,
      },
      include: {
        job: {
          include: {
            bookingRequest: true,
          },
        },
        cseUser: true,
      },
    });
  }
}
