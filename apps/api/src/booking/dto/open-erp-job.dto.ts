import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenERPJobDto {
  @ApiProperty({ example: 'JOB-2024-001' })
  @IsString()
  @MinLength(3)
  erpJobNo: string;
}