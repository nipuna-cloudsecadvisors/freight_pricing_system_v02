import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+94771234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: ['ADMIN', 'SBU_HEAD', 'SALES', 'CSE', 'PRICING', 'MGMT'] })
  @IsEnum(['ADMIN', 'SBU_HEAD', 'SALES', 'CSE', 'PRICING', 'MGMT'])
  role: string;

  @ApiProperty({ example: 'sbu-uuid', required: false })
  @IsOptional()
  @IsUUID()
  sbuId?: string;
}