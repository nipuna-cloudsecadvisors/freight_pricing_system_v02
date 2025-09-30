import { IsEnum, IsString, IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ['SYSTEM', 'EMAIL', 'SMS'] })
  @IsEnum(['SYSTEM', 'EMAIL', 'SMS'])
  channel: 'SYSTEM' | 'EMAIL' | 'SMS';

  @ApiProperty({ example: 'New Rate Request' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'You have a new rate request to process' })
  @IsString()
  body: string;

  @ApiProperty({ example: { type: 'rate_request', id: '123' }, required: false })
  @IsOptional()
  @IsObject()
  meta?: any;
}