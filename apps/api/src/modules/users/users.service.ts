import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole, sbuId?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(sbuId && { sbuId }),
        status: 'ACTIVE',
      },
      include: {
        sbu: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        sbu: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUsersByRole(role: UserRole) {
    return this.prisma.user.findMany({
      where: {
        role,
        status: 'ACTIVE',
      },
      include: {
        sbu: true,
      },
    });
  }

  async getPricingTeamAssignments() {
    return this.prisma.pricingTeamAssignment.findMany({
      include: {
        user: true,
        tradeLane: true,
      },
    });
  }

  async assignPricingTeam(tradeLaneId: string, userId: string) {
    return this.prisma.pricingTeamAssignment.create({
      data: {
        tradeLaneId,
        userId,
      },
      include: {
        user: true,
        tradeLane: true,
      },
    });
  }

  async removePricingTeamAssignment(assignmentId: string) {
    return this.prisma.pricingTeamAssignment.delete({
      where: { id: assignmentId },
    });
  }
}
