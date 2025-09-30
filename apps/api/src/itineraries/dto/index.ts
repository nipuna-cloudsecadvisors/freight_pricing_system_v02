import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ItineraryType } from '@prisma/client';

export class CreateItineraryDto {
  @ApiProperty({ enum: ItineraryType })
  @IsEnum(ItineraryType)
  type: ItineraryType;

  @ApiProperty()
  @IsDateString()
  weekStart: string;
}

export class UpdateItineraryDto extends PartialType(CreateItineraryDto) {}

export class CreateItineraryItemDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiProperty({ example: 'Client meeting' })
  @IsString()
  purpose: string;

  @ApiProperty({ example: '10:00 AM - 11:00 AM' })
  @IsString()
  plannedTime: string;

  @ApiProperty({ example: 'Client office, Colombo 03' })
  @IsString()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveRejectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}