import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestRateUpdateDto {
  @ApiProperty({ example: 'Rate is outdated and needs revision' })
  @IsString()
  @MinLength(10)
  reason: string;
}