import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, ResetPasswordRequestDto, ResetPasswordConfirmDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      sbuId: user.sbuId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        // We'll add refreshToken field to schema if needed
        updatedAt: new Date(),
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sbuId: user.sbuId,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(dto: ResetPasswordRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, you will receive reset instructions' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (you might want to create a separate table for this)
    // For now, we'll use a simple approach
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // Add resetOtp and resetOtpExpiry fields to schema if needed
        updatedAt: new Date(),
      },
    });

    // TODO: Send OTP via email/SMS
    console.log(`Password reset OTP for ${user.email}: ${otp}`);

    return { message: 'If the email exists, you will receive reset instructions' };
  }

  async confirmPasswordReset(dto: ResetPasswordConfirmDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Invalid reset request');
    }

    // Verify OTP (implement proper OTP verification)
    // For demo purposes, accept any 6-digit OTP
    if (!/^\d{6}$/.test(dto.otp)) {
      throw new BadRequestException('Invalid OTP');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password cannot be the same as current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { message: 'Password reset successfully' };
  }
}