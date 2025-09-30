import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveCustomerDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}