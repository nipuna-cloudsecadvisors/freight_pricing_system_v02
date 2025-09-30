import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerApprovalStatus } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, createdById: string) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        createdById,
        approvalStatus: 'PENDING',
      },
      include: {
        createdBy: true,
        approvedBy: true,
      },
    });
  }

  async findAll(status?: CustomerApprovalStatus, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        ...(status && { approvalStatus: status }),
        ...(search && {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        createdBy: true,
        approvedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: true,
        approvedBy: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    
    if (customer.approvalStatus === 'APPROVED') {
      throw new BadRequestException('Cannot update approved customer');
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
      include: {
        createdBy: true,
        approvedBy: true,
      },
    });
  }

  async approve(id: string, approvedById: string) {
    const customer = await this.findOne(id);
    
    if (customer.approvalStatus !== 'PENDING') {
      throw new BadRequestException('Customer is not pending approval');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        createdBy: true,
        approvedBy: true,
      },
    });
  }

  async reject(id: string, approvedById: string) {
    const customer = await this.findOne(id);
    
    if (customer.approvalStatus !== 'PENDING') {
      throw new BadRequestException('Customer is not pending approval');
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        approvedById,
        approvedAt: new Date(),
      },
      include: {
        createdBy: true,
        approvedBy: true,
      },
    });
  }

  async getApprovedCustomers() {
    return this.prisma.customer.findMany({
      where: { approvalStatus: 'APPROVED' },
      orderBy: { companyName: 'asc' },
    });
  }
}
