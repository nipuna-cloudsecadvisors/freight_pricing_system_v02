import { IsString, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredefinedRateDto {
  @ApiProperty({ example: 'trade-lane-id-1' })
  @IsString()
  tradeLaneId: string;

  @ApiProperty({ example: 'port-id-1' })
  @IsString()
  polId: string;

  @ApiProperty({ example: 'port-id-2' })
  @IsString()
  podId: string;

  @ApiProperty({ example: 'Weekly Service' })
  @IsString()
  service: string;

  @ApiProperty({ example: 'equip-type-id-1' })
  @IsString()
  equipTypeId: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isLcl?: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ example: 'Special conditions apply', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
