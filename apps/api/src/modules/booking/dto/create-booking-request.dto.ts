import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingRequestDto {
  @ApiProperty({ example: 'customer-id-1' })
  @IsString()
  customerId: string;

  @ApiProperty({ example: 'predefined', enum: ['predefined', 'request'] })
  @IsEnum(['predefined', 'request'])
  rateSource: 'predefined' | 'request';

  @ApiProperty({ example: 'rate-id-1' })
  @IsString()
  linkId: string;
}
