import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectRateRequestDto {
  @ApiProperty({ example: 'Rate request rejected due to insufficient information' })
  @IsString()
  @MinLength(10)
  remark: string;
}