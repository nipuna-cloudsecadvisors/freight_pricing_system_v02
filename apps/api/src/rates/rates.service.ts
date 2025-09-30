import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatesService {
  constructor(private prisma: PrismaService) {}

  // Generate unique reference number for rate requests
  generateRefNo(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RR${timestamp}${random}`;
  }

  // Get Colombo port ID (default POL)
  async getColomboPortId(): Promise<string> {
    const colombo = await this.prisma.port.findFirst({
      where: { unlocode: 'LKCMB' },
    });
    
    if (!colombo) {
      throw new Error('Colombo port not found in database');
    }
    
    return colombo.id;
  }

  // Calculate processed percentage for rate requests
  calculateProcessedPercentage(rateRequest: any): number {
    if (rateRequest.preferredLineId === null) {
      return 0; // No percentage shown if "Any" line
    }

    const totalResponses = rateRequest.responses?.length || 0;
    const selectedQuotes = rateRequest.lineQuotes?.filter((q: any) => q.selected).length || 0;
    
    if (totalResponses === 0) return 0;
    return Math.round((selectedQuotes / totalResponses) * 100);
  }

  // Check if rate is expiring soon (within 7 days)
  isExpiringSoon(validTo: Date): boolean {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return validTo <= sevenDaysFromNow;
  }

  // Check if rate is expired
  isExpired(validTo: Date): boolean {
    return validTo < new Date();
  }

  // Get rate status with visual indicators
  getRateStatus(validFrom: Date, validTo: Date): { status: string; color: string } {
    const now = new Date();
    
    if (validTo < now) {
      return { status: 'expired', color: 'red' };
    }
    
    if (this.isExpiringSoon(validTo)) {
      return { status: 'expiring', color: 'yellow' };
    }
    
    return { status: 'active', color: 'green' };
  }
}