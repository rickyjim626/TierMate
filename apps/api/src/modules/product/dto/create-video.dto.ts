import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ description: '视频URL' })
  @IsString()
  videoUrl: string;

  @ApiPropertyOptional({ description: '视频封面URL' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '视频时长（秒）' })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: '视频标题' })
  @IsString()
  @IsOptional()
  title?: string;
}
