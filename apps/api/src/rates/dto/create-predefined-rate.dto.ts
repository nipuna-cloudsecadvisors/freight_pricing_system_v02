import { IsString, IsBoolean, IsDateString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredefinedRateDto {
  @ApiProperty({ example: 'trade-lane-uuid' })
  @IsUUID()
  tradeLaneId: string;

  @ApiProperty({ example: 'port-uuid' })
  @IsUUID()
  polId: string;

  @ApiProperty({ example: 'port-uuid' })
  @IsUUID()
  podId: string;

  @ApiProperty({ example: 'Weekly Service' })
  @IsString()
  service: string;

  @ApiProperty({ example: 'equipment-type-uuid' })
  @IsUUID()
  equipTypeId: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isLcl: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}