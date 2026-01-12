'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2 } from 'lucide-react';
import { MobileBloggerHeader } from './MobileBloggerHeader';
import { MobileBloggerProductGrid } from './MobileBloggerProductGrid';
import { MobileCategoryTabs } from '../category/MobileCategoryTabs';
import { useUserProfile, useUserProducts, useToggleFollow } from '@/hooks/api';
import type { CategoryStat } from '@/types';

interface MobileBloggerProfileProps {
  userId: string;
}

export function MobileBloggerProfile({ userId }: MobileBloggerProfileProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // 获取用户资料
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(userId);

  // 获取用户产品
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useUserProducts({
    userId,
    categoryId: activeCategory || undefined,
    limit: 50,
  });

  // 关注/取消关注
  const { mutate: toggleFollow, isPending: isFollowPending } = useToggleFollow(userId);

  // 处理分类切换
  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setActiveCategory(categoryId);
  }, []);

  // 处理关注
  const handleFollowToggle = useCallback(() => {
    toggleFollow();
  }, [toggleFollow]);

  // 处理分享
  const handleShare = useCallback(() => {
    if (navigator.share && profile) {
      navigator.share({
        title: `${profile.name}的主页`,
        text: profile.bio || `来看看${profile.name}分享的好物`,
        url: window.location.href,
      });
    }
  }, [profile]);

  // 加载中状态
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white px-4 py-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-18 h-18 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
          </div>
        </div>
        <div className="h-12 bg-white animate-pulse mt-2" />
        <div className="grid grid-cols-2 gap-3 px-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 错误状态
  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😢</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">用户不存在</h2>
          <p className="text-gray-500 mb-4">该用户可能已被删除或链接无效</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-primary-600 text-white rounded-full text-sm font-medium"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 过滤出有产品的分类
  const categoriesWithProducts: CategoryStat[] = profile.categoryStats.filter(
    (cat) => cat.count > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">博主主页</h1>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 用户信息头部 */}
      <MobileBloggerHeader
        profile={profile}
        isFollowing={profile.isFollowing || false}
        onFollowToggle={handleFollowToggle}
        isLoading={isFollowPending}
      />

      {/* 分类 Tab */}
      {categoriesWithProducts.length > 0 && (
        <MobileCategoryTabs
          categories={categoriesWithProducts}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          className="sticky top-[calc(env(safe-area-inset-top)+52px)] z-40"
        />
      )}

      {/* 产品网格 */}
      <div className="mt-4">
        <MobileBloggerProductGrid
          products={productsData?.data || []}
          isLoading={productsLoading}
        />
      </div>

      {/* 加载更多 / 到底了 */}
      {productsData && productsData.data.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-6 pb-4">
          {productsData.pagination.page >= productsData.pagination.totalPages
            ? '— 已经到底了 —'
            : '上拉加载更多'}
        </p>
      )}
    </div>
  );
}
