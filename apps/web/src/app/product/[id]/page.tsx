'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileProductDetail, mockProductDetail } from '@/components/mobile';

interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const isMobile = useIsMobile();

  // 实际项目中这里应该从 API 获取产品数据
  const product = {
    ...mockProductDetail,
    id: params.id,
  };

  if (isMobile) {
    return <MobileProductDetail product={product} />;
  }

  // 桌面端产品详情页（简化版本）
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {product.title}
        </h1>
        <p className="text-gray-600">{product.description}</p>
      </div>
    </div>
  );
}
