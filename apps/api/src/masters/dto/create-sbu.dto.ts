import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSBUDto {
  @ApiProperty({ example: 'South Asia SBU' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  headUserId: string;
}