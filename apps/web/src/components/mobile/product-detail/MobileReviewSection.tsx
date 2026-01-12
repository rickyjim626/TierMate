'use client';

import { useState } from 'react';
import { Star, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileRatingStars } from './MobileRatingStars';
import { MobileReviewCard } from './MobileReviewCard';
import type { ProductReview, ReviewSummary } from '@/types';

interface MobileReviewSectionProps {
  reviews: ProductReview[];
  summary: ReviewSummary;
  totalReviews: number;
  onViewAll?: () => void;
  className?: string;
}

export function MobileReviewSection({
  reviews,
  summary,
  totalReviews,
  onViewAll,
  className,
}: MobileReviewSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  // 计算每个评分的百分比
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className={cn('bg-white', className)}>
      {/* 区块标题 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">站内评价</h3>
          <span className="text-sm text-gray-400">({totalReviews})</span>
        </div>
        {totalReviews > 3 && onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-primary-600"
          >
            全部评价 <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 评分统计 */}
      <div className="flex items-center gap-6 px-4 py-4 border-b border-gray-100">
        {/* 平均评分 */}
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-600">
            {summary.averageRating.toFixed(1)}
          </p>
          <MobileRatingStars rating={summary.averageRating} size="sm" />
          <p className="text-xs text-gray-400 mt-1">{totalReviews} 条评价</p>
        </div>

        {/* 评分分布 */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4">{star}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{
                    width: `${getPercentage(summary.ratingDistribution[star] || 0)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">
                {summary.ratingDistribution[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 评价列表 */}
      {reviews.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {displayedReviews.map((review) => (
            <MobileReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm">暂无评价</p>
          <p className="text-gray-400 text-xs mt-1">成为第一个评价的人吧</p>
        </div>
      )}

      {/* 查看更多按钮 */}
      {reviews.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 text-center text-sm text-primary-600 border-t border-gray-100"
        >
          展开更多评价
        </button>
      )}
    </div>
  );
}
