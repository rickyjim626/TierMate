'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    description: string;
    content: string;
    images: string[];
    price?: number;
    likes: number;
    comments: number;
    collected: number;
    author: {
      id: string;
      name: string;
      avatar: string;
      followers: number;
    };
    tags: string[];
    createdAt: string;
  };
}

// 模拟产品数据
export const mockProductDetail = {
  id: '1',
  title: 'Apple AirPods Pro 2 真无线降噪耳机 - 使用一年真实体验',
  description: '主动降噪，自适应透明模式，空间音频，MagSafe 充电盒',
  content: `使用 AirPods Pro 2 已经一年了，今天来分享一下真实使用体验。

## 降噪效果

降噪效果真的很出色，在地铁上基本可以隔绝大部分噪音。自适应透明模式也很实用，在需要和人交流的时候不用摘耳机。

## 音质表现

音质方面中规中矩，对于日常听歌来说完全够用。空间音频功能在看电影的时候体验很棒。

## 续航体验

续航方面单次可以用4-5小时，配合充电盒用一天完全没问题。

## 佩戴舒适度

硅胶耳塞有三种尺寸可选，找到合适的佩戴一天也不会觉得累。

## 总结

如果你是苹果全家桶用户，AirPods Pro 2 绝对是最佳选择。设备间切换无缝，功能也很完善。`,
  images: [
    'https://picsum.photos/seed/airpods1/800/600',
    'https://picsum.photos/seed/airpods2/800/600',
    'https://picsum.photos/seed/airpods3/800/600',
  ],
  price: 1899,
  likes: 2341,
  comments: 156,
  collected: 892,
  author: {
    id: 'u1',
    name: '数码达人小明',
    avatar: 'https://i.pravatar.cc/150?u=author1',
    followers: 12580,
  },
  tags: ['数码', '耳机', 'Apple', '降噪'],
  createdAt: '2024-01-15',
};

export function MobileProductDetail({
  product = mockProductDetail,
}: Partial<ProductDetailProps>) {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
  }, []);

  const handleCollect = useCallback(() => {
    setCollected((prev) => !prev);
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    }
  }, [product]);

  return (
    <div className="min-h-screen bg-white pb-20">
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
          src={product.images[currentImage]}
          alt={product.title}
          fill
          className="object-cover"
          priority
        />
        {/* 图片指示器 */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, index) => (
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
        {/* 价格标签 */}
        {product.price && (
          <div className="absolute bottom-4 left-4 bg-primary-600 text-white px-4 py-1.5 rounded-full font-semibold">
            ¥{product.price}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-4">
        {/* 作者信息 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image
              src={product.author.avatar}
              alt={product.author.name}
              width={44}
              height={44}
              className="rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{product.author.name}</p>
              <p className="text-xs text-gray-500">
                {product.author.followers.toLocaleString()} 粉丝
              </p>
            </div>
          </div>
          <button className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded-full font-medium active:bg-primary-700">
            关注
          </button>
        </div>

        {/* 标题 */}
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          {product.title}
        </h1>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 正文内容 */}
        <div
          className={cn(
            'prose prose-sm max-w-none text-gray-700 relative',
            !expanded && 'max-h-48 overflow-hidden'
          )}
        >
          {product.content.split('\n').map((line, i) => (
            <p key={i} className={line.startsWith('##') ? 'font-semibold mt-4' : ''}>
              {line.replace('## ', '')}
            </p>
          ))}
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {/* 展开/收起按钮 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full py-3 text-primary-600 text-sm font-medium"
        >
          {expanded ? (
            <>
              收起 <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              展开全文 <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* 发布时间 */}
        <p className="text-xs text-gray-400 mt-4">
          发布于 {product.createdAt}
        </p>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
        <div className="flex items-center justify-around py-3 px-4">
          <button
            onClick={handleLike}
            className={cn(
              'flex flex-col items-center gap-1',
              liked ? 'text-red-500' : 'text-gray-500'
            )}
          >
            <Heart className={cn('w-6 h-6', liked && 'fill-current')} />
            <span className="text-xs">{product.likes + (liked ? 1 : 0)}</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-500">
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">{product.comments}</span>
          </button>

          <button
            onClick={handleCollect}
            className={cn(
              'flex flex-col items-center gap-1',
              collected ? 'text-yellow-500' : 'text-gray-500'
            )}
          >
            <Bookmark className={cn('w-6 h-6', collected && 'fill-current')} />
            <span className="text-xs">
              {product.collected + (collected ? 1 : 0)}
            </span>
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
