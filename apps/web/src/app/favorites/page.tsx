'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout, MobileProductCard, Product } from '@/components/mobile';
import { Heart } from 'lucide-react';

// 模拟收藏数据
const mockFavorites: Product[] = [
  {
    id: 'f1',
    title: 'Apple AirPods Pro 2 真无线降噪耳机',
    description: '主动降噪，自适应透明模式，空间音频',
    imageUrl: 'https://picsum.photos/seed/fav1/800/600',
    price: 1899,
    likes: 2341,
    comments: 156,
    author: { name: '数码达人', avatar: 'https://i.pravatar.cc/150?u=fav1' },
  },
  {
    id: 'f2',
    title: 'Kindle Paperwhite 电子书阅读器',
    description: '6.8英寸屏幕，可调节冷暖光',
    imageUrl: 'https://picsum.photos/seed/fav2/800/600',
    price: 1068,
    likes: 1567,
    comments: 78,
    author: { name: '读书分享官', avatar: 'https://i.pravatar.cc/150?u=fav2' },
  },
];

export default function FavoritesPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout showTabBar={true} showHeader={true} headerTitle="我的收藏">
        {mockFavorites.length > 0 ? (
          <div className="space-y-4 px-4 py-4">
            {mockFavorites.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <Heart className="w-16 h-16 mb-4" />
            <p>还没有收藏任何好物</p>
            <p className="text-sm mt-1">快去发现页看看吧</p>
          </div>
        )}
      </MobileLayout>
    );
  }

  // 桌面端收藏页
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">我的收藏</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">收藏列表</p>
        </div>
      </div>
    </div>
  );
}
