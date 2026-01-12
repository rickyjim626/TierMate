import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // 获取博主主页完整信息
  async getProfile(userId: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 获取用户产品的总点赞数
    const likesCount = await this.prisma.like.count({
      where: {
        product: {
          authorId: userId,
        },
      },
    });

    // 获取用户发布的产品按分类统计
    const categoryStats = await this.prisma.product.groupBy({
      by: ['categoryId'],
      where: { authorId: userId },
      _count: true,
    });

    // 获取分类详情
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const categoriesWithCount = categories.map((cat) => {
      const stat = categoryStats.find((s) => s.categoryId === cat.id);
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        productCount: stat?._count || 0,
      };
    });

    // 检查当前用户是否关注了该博主
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      stats: {
        products: user._count.products,
        followers: user._count.followers,
        following: user._count.following,
        totalLikes: likesCount,
      },
      categories: categoriesWithCount,
      isFollowing,
    };
  }

  // 获取用户产品（支持分类筛选）
  async getUserProducts(
    userId: string,
    page = 1,
    limit = 10,
    categoryId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      authorId: userId,
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        likes: p._count.likes,
        comments: p._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 关注/取消关注用户
  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('不能关注自己');
    }

    // 检查目标用户是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查是否已关注
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // 取消关注
      await this.prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return { isFollowing: false };
    } else {
      // 关注
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      return { isFollowing: true };
    }
  }

  // 检查关注状态
  async checkFollowStatus(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return { isFollowing: !!follow };
  }

  // 获取粉丝列表
  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      data: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 获取关注列表
  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      data: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
