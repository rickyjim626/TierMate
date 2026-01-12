'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from '@/components/layout/header';
import { ProductGrid } from '@/components/product/product-grid';
import { MobileLayout, MobileProductFeed } from '@/components/mobile';

export function HomePageClient() {
  const isMobile = useIsMobile();

  // 移动端布局
  if (isMobile) {
    return (
      <MobileLayout showTabBar={true} showHeader={false}>
        {/* 移动端顶部 Banner */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-6 text-white">
          <h1 className="text-2xl font-bold mb-2">发现好物</h1>
          <p className="text-primary-100 text-sm">
            分享美好生活，发现优质产品
          </p>
        </div>

        {/* 分类标签滚动 */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
            {['推荐', '数码', '家居', '美妆', '服饰', '美食', '运动'].map(
              (tag, index) => (
                <button
                  key={tag}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    index === 0
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>

        {/* 产品 Feed */}
        <MobileProductFeed />
      </MobileLayout>
    );
  }

  // 桌面端布局
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            发现好物，分享美好
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            TierMate 是一个好物分享平台，在这里你可以发现优质产品，
            分享你的使用体验，与志同道合的人交流心得。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            热门推荐
          </h2>
          <ProductGrid />
        </section>
      </main>
    </div>
  );
}
