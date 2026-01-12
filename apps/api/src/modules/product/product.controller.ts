import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';

// 可选认证守卫
class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    return user || null;
  }
}

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll({
      page: +page,
      limit: +limit,
      categoryId,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取产品详情' })
  async findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Get(':id/detail')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: '获取产品完整详情（含视频、评价摘要）' })
  async getDetail(@Param('id') id: string, @Request() req: any) {
    const currentUserId = req.user?.id;
    return this.productService.getDetail(id, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布产品' })
  async create(@Request() req: any, @Body() dto: CreateProductDto) {
    return this.productService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新产品' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除产品' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.productService.delete(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞/取消点赞' })
  async like(@Request() req: any, @Param('id') id: string) {
    return this.productService.like(id, req.user.id);
  }

  @Get(':id/liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查是否已点赞' })
  async checkLiked(@Request() req: any, @Param('id') id: string) {
    return this.productService.checkLiked(id, req.user.id);
  }

  // ========== 视频相关端点 ==========

  @Get(':id/videos')
  @ApiOperation({ summary: '获取产品视频列表' })
  async getVideos(@Param('id') id: string) {
    return this.productService.getVideos(id);
  }

  @Post(':id/videos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加产品视频' })
  async addVideo(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateVideoDto,
  ) {
    return this.productService.addVideo(id, req.user.id, dto);
  }

  @Delete(':id/videos/:videoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除产品视频' })
  async deleteVideo(
    @Request() req: any,
    @Param('videoId') videoId: string,
  ) {
    return this.productService.deleteVideo(videoId, req.user.id);
  }

  // ========== 评价相关端点 ==========

  @Get(':id/reviews')
  @ApiOperation({ summary: '获取产品评价列表（含评分统计）' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getReviews(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productService.getReviews(id, +page, +limit);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布产品评价' })
  async createReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.productService.createReview(id, req.user.id, dto);
  }

  @Patch(':id/reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新产品评价' })
  async updateReview(
    @Request() req: any,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.productService.updateReview(reviewId, req.user.id, dto);
  }

  @Delete(':id/reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除产品评价' })
  async deleteReview(
    @Request() req: any,
    @Param('reviewId') reviewId: string,
  ) {
    return this.productService.deleteReview(reviewId, req.user.id);
  }
}
