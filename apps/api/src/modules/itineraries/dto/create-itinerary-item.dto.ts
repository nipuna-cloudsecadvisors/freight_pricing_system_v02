import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItineraryItemDto {
  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'customer-id-1', required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ example: 'lead-id-1', required: false })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ example: 'Customer visit' })
  @IsString()
  purpose: string;

  @ApiProperty({ example: '10:00 AM - 11:00 AM' })
  @IsString()
  plannedTime: string;

  @ApiProperty({ example: 'Customer Office, Colombo' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Discuss new shipment requirements', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
