import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get all users' })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('sbuId') sbuId?: string,
  ) {
    return this.usersService.findAll(role, sbuId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  async getUsersByRole(@Param('role') role: UserRole) {
    return this.usersService.getUsersByRole(role);
  }

  @Get('pricing/assignments')
  @Roles(UserRole.ADMIN, UserRole.SBU_HEAD)
  @ApiOperation({ summary: 'Get pricing team assignments' })
  async getPricingTeamAssignments() {
    return this.usersService.getPricingTeamAssignments();
  }
}
