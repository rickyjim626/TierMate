import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  async create(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.commentService.create(req.user.id, dto);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '获取产品评论' })
  async findByProduct(
    @Param('productId') productId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.commentService.findByProduct(productId, +page, +limit);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.commentService.delete(id, req.user.id);
  }
}
