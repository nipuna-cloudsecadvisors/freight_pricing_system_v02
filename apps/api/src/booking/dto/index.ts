import { IsString, IsUUID, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingRequestDto {
  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: ['predefined', 'request'] })
  @IsString()
  rateSource: string;

  @ApiProperty({ description: 'predefined_rate_id or line_quote_id' })
  @IsUUID()
  linkId: string;
}

export class CreateRoDocumentDto {
  @ApiProperty({ example: 'RO123456' })
  @IsString()
  number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty()
  @IsDateString()
  receivedAt: string;
}

export class CreateJobDto {
  @ApiProperty({ example: 'ERP-JOB-2024-001' })
  @IsString()
  erpJobNo: string;
}

export class CompleteJobDto {
  @ApiProperty({ 
    example: { 
      containerNo: 'MSKU1234567',
      vesselName: 'MSC JADE',
      etd: '2024-01-15',
      eta: '2024-01-25',
      notes: 'Cargo loaded successfully'
    } 
  })
  @IsObject()
  detailsJson: any;
}