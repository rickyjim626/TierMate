import { Injectable, NotFoundException } from '@nestjs/common';
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
