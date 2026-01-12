import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

// 可选认证守卫
class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    return user || null;
  }
}

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getCurrentUser(@Request() req: any) {
    return this.userService.findById(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新当前用户信息' })
  async updateCurrentUser(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get(':id/profile')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: '获取博主主页完整信息（含分类统计）' })
  async getUserProfile(@Param('id') id: string, @Request() req: any) {
    const currentUserId = req.user?.id;
    return this.userService.getProfile(id, currentUserId);
  }

  @Get(':id/products')
  @ApiOperation({ summary: '获取用户发布的产品（支持分类筛选）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  async getUserProducts(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.userService.getUserProducts(id, +page, +limit, categoryId);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '关注/取消关注用户（toggle）' })
  async toggleFollow(@Param('id') id: string, @Request() req: any) {
    return this.userService.toggleFollow(req.user.id, id);
  }

  @Get(':id/follow-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查是否已关注该用户' })
  async getFollowStatus(@Param('id') id: string, @Request() req: any) {
    return this.userService.checkFollowStatus(req.user.id, id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: '获取用户的粉丝列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFollowers(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.userService.getFollowers(id, +page, +limit);
  }

  @Get(':id/following')
  @ApiOperation({ summary: '获取用户的关注列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFollowing(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.userService.getFollowing(id, +page, +limit);
  }
}
