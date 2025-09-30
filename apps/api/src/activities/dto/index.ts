import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ActivityType, LeadStage } from '@prisma/client';

export class CreateSalesActivityDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  nextActionDate?: string;
}

export class UpdateSalesActivityDto extends PartialType(CreateSalesActivityDto) {}

export class CreateLeadDto {
  @ApiProperty({ example: 'Global Textile Exports' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'Mr. Anura Bandara (+94771234581)' })
  @IsString()
  contact: string;

  @ApiProperty({ enum: LeadStage, default: LeadStage.PROSPECT })
  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @ApiProperty({ example: 'Trade Fair', required: false })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}