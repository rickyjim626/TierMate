import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Get(':id/products')
  @ApiOperation({ summary: '获取用户发布的产品' })
  async getUserProducts(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.userService.getUserProducts(id, +page, +limit);
  }
}
