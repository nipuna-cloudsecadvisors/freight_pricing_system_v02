import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingAssignmentDto {
  @ApiProperty({ example: 'trade-lane-uuid' })
  @IsUUID()
  tradeLaneId: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  userId: string;
}