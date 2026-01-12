import { IsString, IsInt, Min, Max, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: '评分 1-5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: '评价内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '评价图片URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: '评分 1-5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: '评价内容' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: '评价图片URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
