import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeImageDto {
  @ApiProperty({
    description: 'Base64 encoded image data (with or without data URI prefix)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
  })
  @IsString()
  @IsNotEmpty({ message: '图片不能为空' })
  image: string;

  @ApiPropertyOptional({
    description: 'Image MIME type (auto-detected if not provided)',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class ProductAnalysisResultDto {
  @ApiProperty({ description: '产品名称', example: 'Apple AirPods Pro 2' })
  title: string;

  @ApiProperty({ description: '品牌', example: 'Apple' })
  brand: string;

  @ApiProperty({ description: '分类', example: '数码电子' })
  category: string;

  @ApiProperty({ description: '建议价格', example: 1899 })
  suggestedPrice: number | null;

  @ApiProperty({ description: '标签', example: ['耳机', '降噪', '蓝牙'] })
  tags: string[];

  @ApiProperty({ description: 'AI生成的描述' })
  description: string;

  @ApiProperty({ description: '识别置信度 (0-1)', example: 0.95 })
  confidence: number;
}

export class AnalyzeImageResponseDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ type: ProductAnalysisResultDto })
  data?: ProductAnalysisResultDto;

  @ApiProperty({ description: '错误信息' })
  error?: string;
}
