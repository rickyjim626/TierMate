'use client';

import Image from 'next/image';
import { MobileRatingStars } from './MobileRatingStars';
import { cn } from '@/lib/utils';
import type { ProductReview } from '@/types';

interface MobileReviewCardProps {
  review: ProductReview;
  className?: string;
}

export function MobileReviewCard({ review, className }: MobileReviewCardProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className={cn('bg-white p-4', className)}>
      {/* 用户信息 */}
      <div className="flex items-center gap-3 mb-3">
        <Image
          src={review.author.avatar || 'https://i.pravatar.cc/150?u=default'}
          alt={review.author.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{review.author.name}</p>
          <div className="flex items-center gap-2">
            <MobileRatingStars rating={review.rating} size="sm" />
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 评价内容 */}
      <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>

      {/* 评价图片 */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {review.images.map((img, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
            >
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
