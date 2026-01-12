import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
      },
    });
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, categoryId, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          category: true,
          _count: {
            select: { likes: true, comments: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        category: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return product;
  }

  // 获取产品完整详情（含视频、评价）
  async getDetail(id: string, currentUserId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            _count: {
              select: { followers: true },
            },
          },
        },
        category: true,
        videos: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { likes: true, comments: true, reviews: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 检查当前用户是否点赞/收藏
    let isLiked = false;
    if (currentUserId) {
      const like = await this.prisma.like.findUnique({
        where: {
          userId_productId: {
            userId: currentUserId,
            productId: id,
          },
        },
      });
      isLiked = !!like;
    }

    // 获取评价摘要
    const reviewStats = await this.prisma.productReview.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...product,
      author: {
        ...product.author,
        followersCount: product.author._count.followers,
      },
      stats: {
        likes: product._count.likes,
        comments: product._count.comments,
        reviews: product._count.reviews,
      },
      reviewSummary: {
        averageRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count,
      },
      isLiked,
    };
  }

  async update(id: string, authorId: string, dto: UpdateProductDto) {
    await this.checkOwnership(id, authorId);

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
      },
    });
  }

  async delete(id: string, authorId: string) {
    await this.checkOwnership(id, authorId);
    return this.prisma.product.delete({ where: { id } });
  }

  async like(productId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingLike) {
      await this.prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    }

    await this.prisma.like.create({
      data: { userId, productId },
    });
    return { liked: true };
  }

  async checkLiked(productId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    return { liked: !!like };
  }

  // ========== 视频相关 ==========

  async addVideo(
    productId: string,
    authorId: string,
    data: { videoUrl: string; thumbnailUrl?: string; duration?: number; title?: string },
  ) {
    await this.checkOwnership(productId, authorId);

    return this.prisma.productVideo.create({
      data: {
        productId,
        ...data,
      },
    });
  }

  async deleteVideo(videoId: string, authorId: string) {
    const video = await this.prisma.productVideo.findUnique({
      where: { id: videoId },
      include: { product: { select: { authorId: true } } },
    });

    if (!video) {
      throw new NotFoundException('视频不存在');
    }

    if (video.product.authorId !== authorId) {
      throw new BadRequestException('无权删除此视频');
    }

    return this.prisma.productVideo.delete({ where: { id: videoId } });
  }

  async getVideos(productId: string) {
    return this.prisma.productVideo.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== 评价相关 ==========

  async createReview(
    productId: string,
    authorId: string,
    data: { rating: number; content: string; images?: string[] },
  ) {
    // 检查产品是否存在
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 不能评价自己的产品
    if (product.authorId === authorId) {
      throw new BadRequestException('不能评价自己的产品');
    }

    // 检查是否已评价
    const existingReview = await this.prisma.productReview.findUnique({
      where: {
        productId_authorId: { productId, authorId },
      },
    });

    if (existingReview) {
      throw new BadRequestException('已经评价过此产品');
    }

    return this.prisma.productReview.create({
      data: {
        productId,
        authorId,
        rating: data.rating,
        content: data.content,
        images: data.images || [],
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async getReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.prisma.productReview.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      this.prisma.productReview.count({ where: { productId } }),
      this.prisma.productReview.aggregate({
        where: { productId },
        _avg: { rating: true },
      }),
    ]);

    // 计算评分分布
    const ratingDistribution = await this.prisma.productReview.groupBy({
      by: ['rating'],
      where: { productId },
      _count: true,
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((r) => {
      distribution[r.rating] = r._count;
    });

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        averageRating: stats._avg.rating || 0,
        totalReviews: total,
        ratingDistribution: distribution,
      },
    };
  }

  async updateReview(
    reviewId: string,
    authorId: string,
    data: { rating?: number; content?: string; images?: string[] },
  ) {
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    if (review.authorId !== authorId) {
      throw new BadRequestException('无权修改此评价');
    }

    return this.prisma.productReview.update({
      where: { id: reviewId },
      data,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async deleteReview(reviewId: string, authorId: string) {
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    if (review.authorId !== authorId) {
      throw new BadRequestException('无权删除此评价');
    }

    return this.prisma.productReview.delete({ where: { id: reviewId } });
  }

  private async checkOwnership(productId: string, authorId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { authorId: true },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    if (product.authorId !== authorId) {
      throw new NotFoundException('无权操作此产品');
    }
  }
}
