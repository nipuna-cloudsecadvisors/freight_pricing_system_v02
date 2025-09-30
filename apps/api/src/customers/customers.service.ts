import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(approvalStatus?: ApprovalStatus) {
    const where = approvalStatus ? { approvalStatus } : {};
    
    return this.prisma.customer.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto, createdBy: string) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        createdBy,
        approvalStatus: ApprovalStatus.PENDING,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async approve(id: string, approvedBy: string) {
    await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async reject(id: string, approvedBy: string) {
    await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.customer.delete({ where: { id } });
  }
}