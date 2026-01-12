'use client';

import { ChevronLeft, Share2, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showShare?: boolean;
  showMore?: boolean;
  onShare?: () => void;
  onMore?: () => void;
  transparent?: boolean;
  className?: string;
}

export function MobileHeader({
  title,
  showBack = false,
  showShare = false,
  showMore = false,
  onShare,
  onMore,
  transparent = false,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 pt-safe tap-transparent',
        transparent
          ? 'bg-transparent'
          : 'bg-white/80 backdrop-blur-lg border-b border-gray-200',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* 左侧按钮 */}
        <div className="flex items-center gap-2 w-20">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="touch-target touch-active flex items-center justify-center -ml-2"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>

        {/* 标题 */}
        {title && (
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        )}

        {/* 右侧按钮 */}
        <div className="flex items-center gap-1 w-20 justify-end">
          {showShare && (
            <button
              onClick={onShare}
              className="touch-target touch-active flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {showMore && (
            <button
              onClick={onMore}
              className="touch-target touch-active flex items-center justify-center"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
