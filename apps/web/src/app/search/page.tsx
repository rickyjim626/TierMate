'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout, MobileSearchPage } from '@/components/mobile';

export default function SearchPage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout showTabBar={true} showHeader={false}>
        <MobileSearchPage />
      </MobileLayout>
    );
  }

  // 桌面端搜索页（简化版本）
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">搜索</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <input
            type="text"
            placeholder="搜索好物..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
