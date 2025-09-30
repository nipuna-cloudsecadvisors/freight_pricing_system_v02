import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SalesActivityType } from '@prisma/client';

export class CreateSalesActivityDto {
  @ApiProperty({ example: 'customer-id-1', required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ example: 'lead-id-1', required: false })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ enum: SalesActivityType, example: 'VISIT' })
  @IsEnum(SalesActivityType)
  type: SalesActivityType;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Customer visit to discuss new shipment requirements' })
  @IsString()
  notes: string;

  @ApiProperty({ example: 'Positive response, will send RFQ next week', required: false })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiProperty({ example: '2024-01-22T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  nextActionDate?: string;
}
