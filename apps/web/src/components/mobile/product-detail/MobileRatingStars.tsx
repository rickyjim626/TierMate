'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileRatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function MobileRatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: MobileRatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
        return (
          <div key={i} className="relative">
            {/* 灰色底星 */}
            <Star className={cn(sizeMap[size], 'text-gray-200 fill-gray-200')} />
            {/* 填充星 */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(sizeMap[size], 'text-yellow-400 fill-yellow-400')}
              />
            </div>
          </div>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
