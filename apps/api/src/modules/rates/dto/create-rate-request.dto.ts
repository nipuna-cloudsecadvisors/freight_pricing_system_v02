import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RateRequestMode, RateRequestType } from '@prisma/client';

export class CreateRateRequestDto {
  @ApiProperty({ enum: RateRequestMode, example: 'SEA' })
  @IsEnum(RateRequestMode)
  mode: RateRequestMode;

  @ApiProperty({ enum: RateRequestType, example: 'FCL' })
  @IsEnum(RateRequestType)
  type: RateRequestType;

  @ApiProperty({ example: 'port-id-1', required: false })
  @IsOptional()
  @IsString()
  polId?: string;

  @ApiProperty({ example: 'port-id-2' })
  @IsString()
  podId: string;

  @ApiProperty({ example: 'DOOR', required: false })
  @IsOptional()
  @IsString()
  doorOrCy?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  usZip?: string;

  @ApiProperty({ example: 'line-id-1', required: false })
  @IsOptional()
  @IsString()
  preferredLineId?: string;

  @ApiProperty({ example: 'equip-type-id-1' })
  @IsString()
  equipTypeId: string;

  @ApiProperty({ example: -18, required: false })
  @IsOptional()
  @IsNumber()
  @Min(-30)
  @Max(30)
  reeferTemp?: number;

  @ApiProperty({ example: 20, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  palletCount?: number;

  @ApiProperty({ example: '120x80x15', required: false })
  @IsOptional()
  @IsString()
  palletDims?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  hsCode?: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @Min(0.1)
  weightTons: number;

  @ApiProperty({ example: 'FOB' })
  @IsString()
  incoterm: string;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  marketRate?: number;

  @ApiProperty({ example: 'Special handling required', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({ example: '2024-02-15T00:00:00Z' })
  @IsDateString()
  cargoReadyDate: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  vesselRequired?: boolean;

  @ApiProperty({ example: '7', enum: ['7', '14', '21', 'other'], default: '7' })
  @IsOptional()
  @IsString()
  detentionFreeTime?: string;

  @ApiProperty({ example: 'customer-id-1' })
  @IsString()
  customerId: string;
}
