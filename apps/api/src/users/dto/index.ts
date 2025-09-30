import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@freightco.lk' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+94771234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SALES })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', required: false })
  @IsOptional()
  @IsString()
  sbuId?: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'newPassword123', required: false })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}