'use client';

import { ExternalLink, Package, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileProductInfoProps {
  price: number | null;
  purchaseUrl: string | null;
  tags: string[];
  className?: string;
}

export function MobileProductInfo({
  price,
  purchaseUrl,
  tags,
  className,
}: MobileProductInfoProps) {
  const handlePurchase = () => {
    if (purchaseUrl) {
      window.open(purchaseUrl, '_blank');
    }
  };

  return (
    <div className={cn('bg-white', className)}>
      {/* 区块标题 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Package className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">产品详情</h3>
      </div>

      <div className="px-4 py-4">
        {/* 价格 */}
        {price !== null && (
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-sm text-gray-500">参考价</span>
            <span className="text-2xl font-bold text-primary-600">¥{price}</span>
          </div>
        )}

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">标签</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 购买按钮 */}
        {purchaseUrl && (
          <button
            onClick={handlePurchase}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-full font-medium active:bg-primary-700"
          >
            <ExternalLink className="w-4 h-4" />
            去购买
          </button>
        )}
      </div>
    </div>
  );
}
