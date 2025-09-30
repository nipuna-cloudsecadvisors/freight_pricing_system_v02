import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ example: 'Customer requested cancellation due to change in requirements' })
  @IsString()
  @MinLength(10)
  cancelReason: string;
}