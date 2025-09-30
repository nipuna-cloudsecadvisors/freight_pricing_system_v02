import { IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ItineraryType } from '@prisma/client';

export class CreateItineraryDto {
  @ApiProperty({ enum: ItineraryType, example: 'SP' })
  @IsEnum(ItineraryType)
  type: ItineraryType;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  @IsDateString()
  weekStart: string;
}
