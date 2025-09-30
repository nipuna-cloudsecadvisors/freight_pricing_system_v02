import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmBookingDto {
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  overrideValidity?: boolean;
}