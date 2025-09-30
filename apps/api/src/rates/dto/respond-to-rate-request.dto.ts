import { IsNumber, IsUUID, IsOptional, IsDateString, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondToRateRequestDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  lineNo: number;

  @ApiProperty({ example: 'shipping-line-uuid', required: false })
  @IsOptional()
  @IsUUID()
  requestedLineId?: string;

  @ApiProperty({ example: 'equipment-type-uuid', required: false })
  @IsOptional()
  @IsUUID()
  requestedEquipTypeId?: string;

  @ApiProperty({ example: 'MSC LORETO', required: false })
  @IsOptional()
  @IsString()
  vesselName?: string;

  @ApiProperty({ example: '2024-02-15T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiProperty({ example: '2024-02-10T14:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiProperty({ example: '2024-02-08T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  fclCutoff?: string;

  @ApiProperty({ example: '2024-02-09T18:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  docCutoff?: string;

  @ApiProperty({ example: '2024-03-01T23:59:59Z' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ 
    example: { 
      oceanFreight: 1200, 
      terminalHandling: 150, 
      documentation: 50,
      total: 1400 
    } 
  })
  @IsObject()
  chargesJson: any;
}