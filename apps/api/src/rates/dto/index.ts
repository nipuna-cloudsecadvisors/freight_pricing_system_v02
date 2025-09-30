import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsDateString, 
  IsNumber, 
  IsObject, 
  IsDecimal,
  Min,
  IsUUID
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
  RateStatus, 
  RateRequestMode, 
  RateRequestType, 
  DoorOrCy, 
  DetentionFreeTime,
  RateRequestStatus 
} from '@prisma/client';
import { Transform } from 'class-transformer';

// Predefined Rates DTOs
export class GetPredefinedRatesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pol?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pod?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  equip?: string;

  @ApiProperty({ enum: RateStatus, required: false })
  @IsOptional()
  @IsEnum(RateStatus)
  status?: RateStatus;
}

export class CreatePredefinedRateDto {
  @ApiProperty()
  @IsUUID()
  tradeLaneId: string;

  @ApiProperty()
  @IsUUID()
  polId: string;

  @ApiProperty()
  @IsUUID()
  podId: string;

  @ApiProperty({ example: 'MSC JADE' })
  @IsString()
  service: string;

  @ApiProperty()
  @IsUUID()
  equipTypeId: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isLcl?: boolean;

  @ApiProperty()
  @IsDateString()
  validFrom: string;

  @ApiProperty()
  @IsDateString()
  validTo: string;

  @ApiProperty({ enum: RateStatus, default: RateStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RateStatus)
  status?: RateStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    example: { oceanFreight: 1850, bunkerAdjustment: 125, currency: 'USD', per: 'container' },
    required: false 
  })
  @IsOptional()
  @IsObject()
  chargesJson?: any;
}

export class UpdatePredefinedRateDto extends PartialType(CreatePredefinedRateDto) {}

export class RequestRateUpdateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

// Rate Requests DTOs
export class GetRateRequestsQueryDto {
  @ApiProperty({ enum: RateRequestStatus, required: false })
  @IsOptional()
  @IsEnum(RateRequestStatus)
  status?: RateRequestStatus;

  @ApiProperty({ required: false, description: 'true to get only current user\'s requests' })
  @IsOptional()
  @IsString()
  mine?: string;
}

export class CreateRateRequestDto {
  @ApiProperty({ enum: RateRequestMode })
  @IsEnum(RateRequestMode)
  mode: RateRequestMode;

  @ApiProperty({ enum: RateRequestType })
  @IsEnum(RateRequestType)
  type: RateRequestType;

  @ApiProperty({ required: false, description: 'Will default to Colombo for Sea Export if not provided' })
  @IsOptional()
  @IsUUID()
  polId?: string;

  @ApiProperty()
  @IsUUID()
  podId: string;

  @ApiProperty({ enum: DoorOrCy })
  @IsEnum(DoorOrCy)
  doorOrCy: DoorOrCy;

  @ApiProperty({ required: false, description: 'Required if Door delivery to US' })
  @IsOptional()
  @IsString()
  usZip?: string;

  @ApiProperty({ required: false, description: 'Leave empty for "Any" line' })
  @IsOptional()
  @IsUUID()
  preferredLineId?: string;

  @ApiProperty()
  @IsUUID()
  equipTypeId: string;

  @ApiProperty({ required: false, description: 'Required for reefer equipment' })
  @IsOptional()
  @IsString()
  reeferTemp?: string;

  @ApiProperty({ required: false, description: 'Required for Flat Rack/Open Top' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  palletCount?: number;

  @ApiProperty({ required: false, description: 'Required for Flat Rack/Open Top' })
  @IsOptional()
  @IsString()
  palletDims?: string;

  @ApiProperty()
  @IsString()
  hsCode: string;

  @ApiProperty({ type: 'number' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  weightTons: number;

  @ApiProperty({ example: 'FOB' })
  @IsString()
  incoterm: string;

  @ApiProperty({ type: 'number', required: false })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  marketRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty()
  @IsDateString()
  cargoReadyDate: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  vesselRequired?: boolean;

  @ApiProperty({ enum: DetentionFreeTime })
  @IsEnum(DetentionFreeTime)
  detentionFreeTime: DetentionFreeTime;

  @ApiProperty()
  @IsUUID()
  customerId: string;
}

export class UpdateRateRequestDto extends PartialType(CreateRateRequestDto) {}

export class CreateRateRequestResponseDto {
  @ApiProperty()
  @IsUUID()
  requestedLineId: string;

  @ApiProperty()
  @IsUUID()
  requestedEquipTypeId: string;

  @ApiProperty({ required: false, description: 'Required if vessel details requested' })
  @IsOptional()
  @IsString()
  vesselName?: string;

  @ApiProperty({ required: false, description: 'Required if vessel details requested' })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiProperty({ required: false, description: 'Required if vessel details requested' })
  @IsOptional()
  @IsDateString()
  etd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fclCutoff?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  docCutoff?: string;

  @ApiProperty()
  @IsDateString()
  validTo: string;

  @ApiProperty({ 
    example: { 
      oceanFreight: 1850, 
      bunkerAdjustment: 125, 
      documentation: 75,
      currency: 'USD' 
    } 
  })
  @IsObject()
  chargesJson: any;
}

export class CreateLineQuoteDto {
  @ApiProperty()
  @IsUUID()
  lineId: string;

  @ApiProperty({ 
    example: { 
      oceanFreight: 1850, 
      bunkerAdjustment: 125, 
      totalCost: 1975,
      currency: 'USD',
      validityDays: 7
    } 
  })
  @IsObject()
  termsJson: any;

  @ApiProperty()
  @IsDateString()
  validTo: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}

export class RejectRateRequestDto {
  @ApiProperty()
  @IsString()
  remark: string;
}