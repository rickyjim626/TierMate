'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTextReviewProps {
  content: string | null;
  className?: string;
}

export function MobileTextReview({ content, className }: MobileTextReviewProps) {
  const [expanded, setExpanded] = useState(false);

  if (!content) {
    return null;
  }

  // 简单的 Markdown 渲染
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 标题 (## )
      if (line.startsWith('## ')) {
        return (
          <h4 key={index} className="font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
            {line.replace('## ', '')}
          </h4>
        );
      }
      // 普通段落
      if (line.trim()) {
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-2 last:mb-0">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  const isLongContent = content.length > 300;
  const displayContent = expanded ? content : content.slice(0, 300);

  return (
    <div className={cn('bg-white', className)}>
      {/* 区块标题 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <FileText className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">博主评价</h3>
      </div>

      {/* 内容 */}
      <div className="px-4 py-4">
        <div
          className={cn(
            'prose prose-sm max-w-none relative',
            !expanded && isLongContent && 'max-h-48 overflow-hidden'
          )}
        >
          {renderContent(displayContent)}
          {!expanded && isLongContent && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {/* 展开/收起按钮 */}
        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1 w-full pt-3 text-primary-600 text-sm font-medium"
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
        )}
      </div>
    </div>
  );
}
