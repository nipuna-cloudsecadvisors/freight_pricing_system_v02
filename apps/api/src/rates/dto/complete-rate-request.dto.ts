import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRateRequestDto {
  @ApiProperty({ example: 'Rate request completed successfully', required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  notes?: string;
}