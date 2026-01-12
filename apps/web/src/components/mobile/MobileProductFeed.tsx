'use client';

import { useState, useCallback } from 'react';
import { MobileProductCard, Product } from './MobileProductCard';
import { ProductCardSkeletonList } from './ProductCardSkeleton';
import { PullToRefresh } from './PullToRefresh';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

// 模拟数据 - 实际使用时从 API 获取
const mockProducts: Product[] = [
  {
    id: '1',
    title: '苹果 AirPods Pro 2 真无线降噪耳机',
    description: '主动降噪，自适应透明模式，空间音频，MagSafe 充电盒，续航更持久',
    imageUrl: 'https://picsum.photos/seed/airpods/800/600',
    price: 1899,
    likes: 2341,
    comments: 156,
    author: {
      name: '数码达人小明',
      avatar: 'https://i.pravatar.cc/150?u=user1',
    },
  },
  {
    id: '2',
    title: '戴森 V15 Detect 无绳吸尘器',
    description: '激光探测微尘，智能感应调节吸力，HEPA 过滤系统，60分钟超长续航',
    imageUrl: 'https://picsum.photos/seed/dyson/800/600',
    price: 5490,
    likes: 1823,
    comments: 89,
    author: {
      name: '家居生活家',
      avatar: 'https://i.pravatar.cc/150?u=user2',
    },
  },
  {
    id: '3',
    title: 'Sony WH-1000XM5 头戴式降噪耳机',
    description: '行业领先降噪，30小时续航，轻量化设计，多点连接，高清通话',
    imageUrl: 'https://picsum.photos/seed/sonyxm5/800/600',
    price: 2999,
    likes: 3102,
    comments: 234,
    author: {
      name: '音乐发烧友',
      avatar: 'https://i.pravatar.cc/150?u=user3',
    },
  },
  {
    id: '4',
    title: 'Kindle Paperwhite 第11代电子书阅读器',
    description: '6.8英寸屏幕，可调节冷暖光，IPX8防水，10周超长续航',
    imageUrl: 'https://picsum.photos/seed/kindle/800/600',
    price: 1068,
    likes: 1567,
    comments: 78,
    author: {
      name: '读书分享官',
      avatar: 'https://i.pravatar.cc/150?u=user4',
    },
  },
  {
    id: '5',
    title: '小米 14 Ultra 旗舰手机',
    description: '徕卡光学系统，1英寸大底主摄，骁龙8 Gen3，120W闪充',
    imageUrl: 'https://picsum.photos/seed/mi14/800/600',
    price: 6499,
    likes: 4521,
    comments: 312,
    author: {
      name: '科技测评员',
      avatar: 'https://i.pravatar.cc/150?u=user5',
    },
  },
];

interface MobileProductFeedProps {
  initialProducts?: Product[];
}

export function MobileProductFeed({
  initialProducts = mockProducts,
}: MobileProductFeedProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    // 模拟 API 请求
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 重置列表
    setProducts(mockProducts);
    setPage(1);
    setHasMore(true);
  }, []);

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    // 模拟 API 请求
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 模拟加载更多数据
    const newProducts = mockProducts.map((p) => ({
      ...p,
      id: `${p.id}-page-${page + 1}`,
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 300),
    }));

    setProducts((prev) => [...prev, ...newProducts]);
    setPage((prev) => prev + 1);
    setLoading(false);

    // 模拟 3 页后没有更多数据
    if (page >= 3) {
      setHasMore(false);
    }
  }, [loading, hasMore, page]);

  // 无限滚动
  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: handleLoadMore,
    threshold: 300,
  });

  // 点赞处理
  const handleLike = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + 1 } : p
      )
    );
  }, []);

  // 分享处理
  const handleShare = useCallback((id: string) => {
    const product = products.find((p) => p.id === id);
    if (product && navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: `${window.location.origin}/product/${id}`,
      });
    }
  }, [products]);

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
        {loading && <ProductCardSkeletonList count={2} />}

        {/* 无限滚动触发器 */}
        {hasMore && <div ref={loadMoreRef} className="h-1" />}

        {/* 没有更多数据 */}
        {!hasMore && (
          <div className="text-center py-8 text-gray-400 text-sm">
            — 已经到底啦 —
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
