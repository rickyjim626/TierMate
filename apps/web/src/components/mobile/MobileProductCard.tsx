'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  likes: number;
  comments: number;
  author: {
    name: string;
    avatar: string;
  };
}

interface MobileProductCardProps {
  product: Product;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

export function MobileProductCard({
  product,
  onLike,
  onShare,
  className,
}: MobileProductCardProps) {
  const { id, title, description, imageUrl, price, likes, comments, author } =
    product;

  return (
    <article
      className={cn(
        'bg-white rounded-2xl overflow-hidden shadow-sm tap-transparent',
        className
      )}
    >
      {/* 图片区域 */}
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-[4/3] bg-gray-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {price && (
            <div className="absolute bottom-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ¥{price.toFixed(0)}
            </div>
          )}
        </div>
      </Link>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 作者信息 */}
        <div className="flex items-center gap-2 mb-3">
          <Image
            src={author.avatar}
            alt={author.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-sm text-gray-600 font-medium">
            {author.name}
          </span>
        </div>

        {/* 标题和描述 */}
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {description}
          </p>
        </Link>

        {/* 互动按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={() => onLike?.(id)}
            className="flex items-center gap-1.5 text-gray-500 touch-active"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm">{likes}</span>
          </button>

          <Link
            href={`/product/${id}#comments`}
            className="flex items-center gap-1.5 text-gray-500 touch-active"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{comments}</span>
          </Link>

          <button
            onClick={() => onShare?.(id)}
            className="flex items-center gap-1.5 text-gray-500 touch-active"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">分享</span>
          </button>
        </div>
      </div>
    </article>
  );
}
