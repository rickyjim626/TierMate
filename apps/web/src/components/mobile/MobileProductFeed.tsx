'use client';

import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MobileProductCard, Product } from './MobileProductCard';
import { ProductCardSkeletonList } from './ProductCardSkeleton';
import { PullToRefresh } from './PullToRefresh';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { getProducts } from '@/lib/api/product';

interface MobileProductFeedProps {
  categoryId?: string;
}

export function MobileProductFeed({ categoryId }: MobileProductFeedProps) {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  // 使用 React Query 获取产品列表
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', 'feed', categoryId],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getProducts({
        page: pageParam,
        limit: 10,
        categoryId,
      });
      return result;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (!isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 无限滚动
  const { loadMoreRef } = useInfiniteScroll({
    hasMore: !!hasNextPage,
    loading: isFetchingNextPage,
    onLoadMore: handleLoadMore,
    threshold: 300,
  });

  // 点赞处理 (乐观更新)
  const handleLike = useCallback((id: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    // TODO: 调用 API 更新点赞状态
  }, []);

  // 分享处理
  const handleShare = useCallback((id: string) => {
    const allProducts = data?.pages.flatMap((p) => p.data) || [];
    const product = allProducts.find((p) => p.id === id);
    if (product && navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: `${window.location.origin}/product/${id}`,
      });
    }
  }, [data]);

  // 转换 API 数据格式为组件所需格式
  const products: Product[] = (data?.pages.flatMap((page) => page.data) || []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    price: p.price || undefined,
    likes: (p._count?.likes || 0) + (likedProducts.has(p.id) ? 1 : 0),
    comments: p._count?.comments || 0,
    author: {
      name: p.author.name,
      avatar: p.author.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + p.author.name,
    },
  }));

  // 加载中状态
  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <ProductCardSkeletonList count={3} />
      </div>
    );
  }

  // 错误状态
  if (isError) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">加载失败</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  // 空状态
  if (products.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-gray-500">暂无好物推荐</p>
        <p className="text-gray-400 text-sm mt-1">去发布你的第一个好物吧</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="space-y-4 px-4 py-4">
        {/* 产品列表 */}
        {products.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            onLike={handleLike}
            onShare={handleShare}
          />
        ))}

        {/* 加载更多骨架屏 */}
        {isFetchingNextPage && <ProductCardSkeletonList count={2} />}

        {/* 无限滚动触发器 */}
        {hasNextPage && <div ref={loadMoreRef} className="h-1" />}

        {/* 没有更多数据 */}
        {!hasNextPage && products.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            — 已经到底啦 —
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
