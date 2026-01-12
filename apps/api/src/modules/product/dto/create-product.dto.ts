import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  MinLength,
  MaxLength,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '产品标题' })
  @IsString()
  @MinLength(2, { message: '标题至少2个字符' })
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: '产品描述' })
  @IsString()
  @MinLength(10, { message: '描述至少10个字符' })
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ description: '产品品牌' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  brand?: string;

  @ApiPropertyOptional({ description: '产品价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '购买链接' })
  @IsOptional()
  @IsUrl()
  purchaseUrl?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '产品图片URL列表' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '产品标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
