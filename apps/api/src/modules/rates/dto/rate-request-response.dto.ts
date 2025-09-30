import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RateRequestResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  lineNo: number;

  @ApiProperty({ example: 'line-id-1', required: false })
  @IsOptional()
  @IsString()
  requestedLineId?: string;

  @ApiProperty({ example: 'equip-type-id-1', required: false })
  @IsOptional()
  @IsString()
  requestedEquipTypeId?: string;

  @ApiProperty({ example: 'MSC LORETO', required: false })
  @IsOptional()
  @IsString()
  vesselName?: string;

  @ApiProperty({ example: '2024-02-20T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiProperty({ example: '2024-02-22T14:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiProperty({ example: '2024-02-18T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  fclCutoff?: string;

  @ApiProperty({ example: '2024-02-19T17:00:00Z', required: false })
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
      documentation: 50 
    } 
  })
  chargesJson: any;
}
