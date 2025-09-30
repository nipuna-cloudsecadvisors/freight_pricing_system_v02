import { IsEnum, IsString, IsUUID, IsOptional, IsNumber, IsBoolean, IsDateString, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRateRequestDto {
  @ApiProperty({ enum: ['SEA', 'AIR'] })
  @IsEnum(['SEA', 'AIR'])
  mode: 'SEA' | 'AIR';

  @ApiProperty({ enum: ['FCL', 'LCL'] })
  @IsEnum(['FCL', 'LCL'])
  type: 'FCL' | 'LCL';

  @ApiProperty({ example: 'port-uuid', required: false })
  @IsOptional()
  @IsUUID()
  polId?: string;

  @ApiProperty({ example: 'port-uuid' })
  @IsUUID()
  podId: string;

  @ApiProperty({ example: 'Door', required: false })
  @IsOptional()
  @IsString()
  doorOrCy?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  usZip?: string;

  @ApiProperty({ example: 'shipping-line-uuid', required: false })
  @IsOptional()
  @IsUUID()
  preferredLineId?: string;

  @ApiProperty({ example: 'equipment-type-uuid' })
  @IsUUID()
  equipTypeId: string;

  @ApiProperty({ example: -18, required: false })
  @IsOptional()
  @IsNumber()
  reeferTemp?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  palletCount?: number;

  @ApiProperty({ example: '120x80x160cm', required: false })
  @IsOptional()
  @IsString()
  palletDims?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  hsCode?: string;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  @Min(0.1)
  weightTons: number;

  @ApiProperty({ example: 'FOB', required: false })
  @IsOptional()
  @IsString()
  incoterm?: string;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  marketRate?: number;

  @ApiProperty({ example: 'Urgent shipment, need quick response', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  specialInstructions?: string;

  @ApiProperty({ example: '2024-02-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  cargoReadyDate?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  vesselRequired: boolean;

  @ApiProperty({ example: '7', enum: ['7', '14', '21', 'other'] })
  @IsEnum(['7', '14', '21', 'other'])
  detentionFreeTime: '7' | '14' | '21' | 'other';

  @ApiProperty({ example: 'customer-uuid' })
  @IsUUID()
  customerId: string;
}