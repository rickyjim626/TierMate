'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileProductDetailEnhanced } from '@/components/mobile/product-detail';

interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileProductDetailEnhanced productId={params.id} />;
  }

  // 桌面端产品详情页（简化版本）
  // TODO: 实现桌面端详情页
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          产品详情
        </h1>
        <p className="text-gray-600">桌面端详情页开发中...</p>
      </div>
    </div>
  );
}
