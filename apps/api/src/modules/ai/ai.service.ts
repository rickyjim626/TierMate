import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductAnalysisResultDto } from './dto/analyze-image.dto';

// TierMate product categories (must match database)
const VALID_CATEGORIES = [
  '数码电子',
  '时尚服饰',
  '美妆护肤',
  '家居生活',
  '美食零食',
  '运动户外',
  '母婴用品',
  '图书文具',
  '其他',
];

interface AIRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface AIRouterRequest {
  model: string;
  messages: AIRouterMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface AIRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly routerBaseUrl: string;
  private readonly routerApiKey: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.routerBaseUrl = this.configService.get<string>(
      'AI_ROUTER_URL',
      'https://router.xiaojinpro.top',
    );
    this.routerApiKey = this.configService.get<string>('AI_ROUTER_API_KEY', '');
    this.model = this.configService.get<string>(
      'AI_VISION_MODEL',
      'gemini-3-pro-preview',
    );

    this.logger.log(`AI Router URL: ${this.routerBaseUrl}`);
    this.logger.log(`AI Vision Model: ${this.model}`);
  }

  /**
   * Analyze product image using AI vision model
   */
  async analyzeProductImage(
    imageBase64: string,
    mimeType?: string,
  ): Promise<ProductAnalysisResultDto> {
    // Normalize image data to data URI format
    const imageUrl = this.normalizeImageData(imageBase64, mimeType);

    const prompt = this.buildAnalysisPrompt();

    const request: AIRouterRequest = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for more consistent results
    };

    try {
      this.logger.log('Sending image to AI Router for analysis...');

      const response = await fetch(`${this.routerBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.routerApiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`AI Router error: ${response.status} - ${errorText}`);
        throw new HttpException(
          `AI 分析失败: ${response.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data: AIRouterResponse = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new HttpException('AI 返回结果为空', HttpStatus.BAD_GATEWAY);
      }

      const content = data.choices[0].message.content;
      this.logger.log(`AI Response: ${content.substring(0, 200)}...`);

      // Parse AI response
      const result = this.parseAIResponse(content);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`AI analysis failed: ${error.message}`, error.stack);
      throw new HttpException(
        `AI 分析失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Normalize image data to data URI format
   */
  private normalizeImageData(imageBase64: string, mimeType?: string): string {
    // If already a data URI, return as-is
    if (imageBase64.startsWith('data:')) {
      return imageBase64;
    }

    // Detect MIME type from base64 header or use provided
    const detectedMime = mimeType || this.detectMimeType(imageBase64);
    return `data:${detectedMime};base64,${imageBase64}`;
  }

  /**
   * Detect image MIME type from base64 data
   */
  private detectMimeType(base64: string): string {
    const signatures: Record<string, string> = {
      '/9j/': 'image/jpeg',
      iVBORw0KGgo: 'image/png',
      R0lGOD: 'image/gif',
      UklGR: 'image/webp',
    };

    for (const [signature, mime] of Object.entries(signatures)) {
      if (base64.startsWith(signature)) {
        return mime;
      }
    }

    return 'image/jpeg'; // Default to JPEG
  }

  /**
   * Build the analysis prompt for AI
   */
  private buildAnalysisPrompt(): string {
    return `你是一个电商产品识别专家。请仔细分析这张产品截图（可能来自淘宝、京东、拼多多等电商平台），提取产品信息。

请返回严格的JSON格式（不要包含任何其他文字）：
{
  "title": "产品名称（简洁准确，不超过50字）",
  "brand": "品牌名称（如无法识别则填\"未知品牌\"）",
  "category": "产品分类",
  "price": 价格数字（如无法识别则填null）,
  "tags": ["标签1", "标签2", "标签3"],
  "description": "产品简短描述（30-100字）",
  "confidence": 置信度数字(0-1)
}

分类只能从以下选项中选择：
${VALID_CATEGORIES.join('、')}

重要提示：
1. 产品名称要简洁，去除促销文案如"限时特价"、"包邮"等
2. 如果是电子产品，品牌通常在产品名称中
3. tags 最多5个，要与产品特性相关
4. price 只提取数字，不含货币符号
5. confidence 反映你对识别结果的确信程度`;
  }

  /**
   * Parse AI response into structured result
   */
  private parseAIResponse(content: string): ProductAnalysisResultDto {
    try {
      // Try to extract JSON from the response
      let jsonStr = content.trim();

      // Handle markdown code blocks
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Parse JSON
      const parsed = JSON.parse(jsonStr);

      // Validate and normalize category
      let category = parsed.category || '其他';
      if (!VALID_CATEGORIES.includes(category)) {
        // Try to find closest match
        const lowerCategory = category.toLowerCase();
        const match = VALID_CATEGORIES.find(
          (c) =>
            c.toLowerCase().includes(lowerCategory) ||
            lowerCategory.includes(c.toLowerCase()),
        );
        category = match || '其他';
      }

      return {
        title: String(parsed.title || '未识别的产品').substring(0, 100),
        brand: String(parsed.brand || '未知品牌').substring(0, 50),
        category,
        suggestedPrice: typeof parsed.price === 'number' ? parsed.price : null,
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.slice(0, 5).map((t: any) => String(t))
          : [],
        description: String(parsed.description || '').substring(0, 500),
        confidence:
          typeof parsed.confidence === 'number'
            ? Math.min(1, Math.max(0, parsed.confidence))
            : 0.5,
      };
    } catch (error) {
      this.logger.warn(`Failed to parse AI response: ${error.message}`);

      // Return default values if parsing fails
      return {
        title: '未识别的产品',
        brand: '未知品牌',
        category: '其他',
        suggestedPrice: null,
        tags: [],
        description: '无法自动识别产品信息，请手动填写',
        confidence: 0,
      };
    }
  }
}
