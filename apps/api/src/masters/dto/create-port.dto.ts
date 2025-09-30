import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortDto {
  @ApiProperty({ example: 'LKCMB' })
  @IsString()
  @Length(5, 5)
  unlocode: string;

  @ApiProperty({ example: 'Colombo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sri Lanka' })
  @IsString()
  country: string;
}