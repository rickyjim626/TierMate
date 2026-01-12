import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  @MinLength(1, { message: '评论内容不能为空' })
  @MaxLength(500, { message: '评论内容最多500字符' })
  content: string;

  @ApiProperty({ description: '产品ID' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: '父评论ID（回复时使用）' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
