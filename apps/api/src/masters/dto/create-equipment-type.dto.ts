import { IsString, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentTypeDto {
  @ApiProperty({ example: '20ft Dry Container' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isReefer: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isFlatRackOpenTop: boolean;
}