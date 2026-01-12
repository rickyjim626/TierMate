import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户名' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ description: '个人简介' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}
