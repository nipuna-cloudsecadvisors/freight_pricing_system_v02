import { IsUUID, IsObject, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLineQuoteDto {
  @ApiProperty({ example: 'shipping-line-uuid' })
  @IsUUID()
  lineId: string;

  @ApiProperty({ example: 'equipment-type-uuid' })
  @IsUUID()
  equipTypeId: string;

  @ApiProperty({ 
    example: { 
      oceanFreight: 1200, 
      terminalHandling: 150, 
      documentation: 50,
      total: 1400,
      terms: 'FOB Colombo',
      validity: '30 days'
    } 
  })
  @IsObject()
  termsJson: any;

  @ApiProperty({ example: '2024-03-01T23:59:59Z' })
  @IsDateString()
  validTo: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  selected: boolean;
}