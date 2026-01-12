import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import {
  AnalyzeImageDto,
  AnalyzeImageResponseDto,
} from './dto/analyze-image.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '分析产品图片',
    description: '使用AI分析电商产品截图，自动识别产品信息（名称、品牌、分类、价格等）',
  })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: AnalyzeImageResponseDto,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 502, description: 'AI服务异常' })
  async analyzeImage(
    @Body() dto: AnalyzeImageDto,
  ): Promise<AnalyzeImageResponseDto> {
    try {
      const result = await this.aiService.analyzeProductImage(
        dto.image,
        dto.mimeType,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || '分析失败',
      };
    }
  }
}
