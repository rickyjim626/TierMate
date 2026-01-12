'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface MobileBloggerProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
}

// 产品卡片骨架屏
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// 小卡片样式 - 类似小红书瀑布流
function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="block bg-white rounded-xl overflow-hidden shadow-sm active:scale-98 transition-transform"
    >
      {/* 图片 */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          className="object-cover"
          sizes="50vw"
        />
        {product.price && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            ¥{product.price}
          </div>
        )}
      </div>

      {/* 内容 */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
          {product.title}
        </h3>

        {/* 互动数据 */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {product._count?.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {product._count?.comments || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MobileBloggerProductGrid({
  products,
  isLoading,
  className,
}: MobileBloggerProductGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-3 px-4', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">📦</span>
        </div>
        <p className="text-gray-500 text-center">暂无好物分享</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 px-4', className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
