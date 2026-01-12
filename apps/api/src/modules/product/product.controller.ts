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
}
