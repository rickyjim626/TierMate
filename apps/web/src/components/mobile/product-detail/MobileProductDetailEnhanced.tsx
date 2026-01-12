'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileVideoSection } from './MobileVideoSection';
import { MobileTextReview } from './MobileTextReview';
import { MobileProductInfo } from './MobileProductInfo';
import { MobileReviewSection } from './MobileReviewSection';
import { useProductDetail, useProductReviews, useToggleLike } from '@/hooks/api';

interface MobileProductDetailEnhancedProps {
  productId: string;
}

export function MobileProductDetailEnhanced({
  productId,
}: MobileProductDetailEnhancedProps) {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [collected, setCollected] = useState(false);

  // 获取产品详情
  const { data: product, isLoading, error } = useProductDetail(productId);

  // 获取评价
  const { data: reviewsData } = useProductReviews(productId);

  // 点赞
  const { mutate: toggleLike, isPending: isLikePending } = useToggleLike(productId);

  // 处理点赞
  const handleLike = useCallback(() => {
    toggleLike();
  }, [toggleLike]);

  // 处理收藏
  const handleCollect = useCallback(() => {
    setCollected((prev) => !prev);
  }, []);

  // 处理分享
  const handleShare = useCallback(() => {
    if (navigator.share && product) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    }
  }, [product]);

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
        <div className="px-4 py-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // 错误
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😢</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">产品不存在</h2>
          <p className="text-gray-500 mb-4">该产品可能已被删除或链接无效</p>
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

  const images = product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-safe">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/40 to-transparent">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 图片轮播 */}
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={images[currentImage]}
          alt={product.title}
          fill
          className="object-cover"
          priority
        />
        {/* 图片指示器 */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentImage ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 作者信息区 */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/user/${product.author.id}`}
            className="flex items-center gap-3"
          >
            <Image
              src={product.author.avatar || 'https://i.pravatar.cc/150?u=default'}
              alt={product.author.name}
              width={44}
              height={44}
              className="rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{product.author.name}</p>
              <p className="text-xs text-gray-500">
                {product.author._count?.followers?.toLocaleString() || 0} 粉丝
              </p>
            </div>
          </Link>
          <Link
            href={`/user/${product.author.id}`}
            className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded-full font-medium active:bg-primary-700"
          >
            查看主页
          </Link>
        </div>

        {/* 标题 */}
        <h1 className="text-xl font-bold text-gray-900 mt-4">{product.title}</h1>

        {/* 描述 */}
        <p className="text-gray-500 text-sm mt-2">{product.description}</p>

        {/* 标签 */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 视频评价区 */}
      {product.videos && product.videos.length > 0 && (
        <MobileVideoSection videos={product.videos} className="mt-2" />
      )}

      {/* 博主文字评价 */}
      {product.content && (
        <MobileTextReview content={product.content} className="mt-2" />
      )}

      {/* 产品详情 */}
      <MobileProductInfo
        price={product.price}
        purchaseUrl={product.purchaseUrl}
        tags={product.tags || []}
        className="mt-2"
      />

      {/* 站内评价 */}
      {reviewsData && (
        <MobileReviewSection
          reviews={reviewsData.data}
          summary={reviewsData.summary}
          totalReviews={reviewsData.pagination.total}
          className="mt-2"
        />
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
        <div className="flex items-center justify-around py-3 px-4">
          <button
            onClick={handleLike}
            disabled={isLikePending}
            className={cn(
              'flex flex-col items-center gap-1',
              product.isLiked ? 'text-red-500' : 'text-gray-500'
            )}
          >
            <Heart className={cn('w-6 h-6', product.isLiked && 'fill-current')} />
            <span className="text-xs">{product.stats.likes}</span>
          </button>

          <Link
            href={`/product/${productId}#reviews`}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">{product.stats.comments}</span>
          </Link>

          <button
            onClick={handleCollect}
            className={cn(
              'flex flex-col items-center gap-1',
              collected ? 'text-yellow-500' : 'text-gray-500'
            )}
          >
            <Bookmark className={cn('w-6 h-6', collected && 'fill-current')} />
            <span className="text-xs">收藏</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs">分享</span>
          </button>
        </div>
      </div>
    </div>
  );
}
