import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommentDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        productId: dto.productId,
        authorId: userId,
        parentId: dto.parentId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async findByProduct(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { productId, parentId: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where: { productId, parentId: null } }),
    ]);

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async delete(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.authorId !== userId) {
      throw new NotFoundException('无权删除此评论');
    }

    return this.prisma.comment.delete({ where: { id } });
  }
}
