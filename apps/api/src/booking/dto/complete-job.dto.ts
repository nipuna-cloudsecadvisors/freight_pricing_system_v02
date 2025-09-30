import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteJobDto {
  @ApiProperty({ 
    example: { 
      completionDate: '2024-02-20T15:30:00Z',
      finalStatus: 'Delivered',
      notes: 'Cargo delivered successfully to consignee',
      documents: ['Delivery Order', 'Invoice', 'Bill of Lading'],
      issues: []
    } 
  })
  @IsObject()
  detailsJson: any;
}