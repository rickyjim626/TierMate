'use client';

import { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 60,
  className,
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const canPull = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (containerRef.current?.scrollTop === 0 && !refreshing) {
        startY.current = e.touches[0].clientY;
        canPull.current = true;
      }
    },
    [refreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!canPull.current || refreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0) {
        // 使用阻尼效果
        const distance = Math.min(diff * 0.5, threshold * 1.5);
        setPullDistance(distance);
        setPulling(true);
      }
    },
    [refreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!canPull.current) return;

    canPull.current = false;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const indicatorRotation = (pullDistance / threshold) * 180;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto overscroll-contain', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉指示器 */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center transition-transform duration-200 -top-12"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: indicatorOpacity,
        }}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center',
            refreshing && 'animate-spin'
          )}
          style={{
            transform: refreshing ? 'none' : `rotate(${indicatorRotation}deg)`,
          }}
        >
          <Loader2 className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      {/* 内容区域 */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: pulling || refreshing ? `translateY(${pullDistance}px)` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
