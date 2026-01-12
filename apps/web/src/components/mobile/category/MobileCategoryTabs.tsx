'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';
import type { CategoryStat } from '@/types';

interface MobileCategoryTabsProps {
  categories: CategoryStat[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  className?: string;
}

export function MobileCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: MobileCategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // 自动滚动到当前选中的 tab
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeButton = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();

      const scrollLeft =
        activeRect.left -
        containerRect.left -
        containerRect.width / 2 +
        activeRect.width / 2 +
        container.scrollLeft;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  // 计算全部分类的总数
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className={cn('bg-white border-b border-gray-100', className)}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1"
      >
        {/* 全部分类 */}
        <button
          ref={activeCategory === null ? activeRef : null}
          onClick={() => onCategoryChange(null)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
            activeCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 active:bg-gray-200'
          )}
        >
          <CategoryIcon icon="all" size={16} />
          <span>全部</span>
          <span className="text-xs opacity-70">({totalCount})</span>
        </button>

        {/* 各分类 */}
        {categories.map((category) => (
          <button
            key={category.categoryId}
            ref={activeCategory === category.categoryId ? activeRef : null}
            onClick={() => onCategoryChange(category.categoryId)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              activeCategory === category.categoryId
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            )}
            style={{
              backgroundColor:
                activeCategory === category.categoryId
                  ? category.categoryColor || '#3B82F6'
                  : undefined,
            }}
          >
            <CategoryIcon icon={category.categoryIcon} size={16} />
            <span>{category.categoryName}</span>
            <span className="text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
