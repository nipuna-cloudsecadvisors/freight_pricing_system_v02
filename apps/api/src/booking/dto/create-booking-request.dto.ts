import { IsEnum, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingRequestDto {
  @ApiProperty({ example: 'customer-uuid' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: ['predefined', 'request'] })
  @IsEnum(['predefined', 'request'])
  rateSource: 'predefined' | 'request';

  @ApiProperty({ example: 'rate-or-request-uuid' })
  @IsUUID()
  linkId: string;
}