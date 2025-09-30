import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        sbu: true,
      },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      sbuId: user.sbuId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sbu: user.sbu,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { sbu: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role,
        sbuId: user.sbuId,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, { 
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' 
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database (in production, use Redis with TTL)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        // In production, store hashed OTP
        // For now, we'll use a simple approach
      },
    });

    // TODO: Send OTP via email/SMS
    console.log(`Password reset OTP for ${email}: ${otp}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async confirmPasswordReset(resetDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetDto;

    // In production, verify OTP from Redis
    // For now, we'll skip OTP verification

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or OTP');
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { sbu: true },
    });
  }
}
