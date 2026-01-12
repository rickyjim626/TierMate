'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { MobileProductCard, Product } from './MobileProductCard';
import { ProductCardSkeletonList } from './ProductCardSkeleton';
import { cn } from '@/lib/utils';

// 热门标签
const hotTags = ['AirPods', '机械键盘', '咖啡机', '投影仪', '空气炸锅', '扫地机器人'];

// 模拟搜索结果
const mockSearchResults: Product[] = [
  {
    id: 's1',
    title: 'Apple AirPods Pro 2 真无线降噪耳机',
    description: '主动降噪，自适应透明模式，空间音频',
    imageUrl: 'https://picsum.photos/seed/airpods-search/800/600',
    price: 1899,
    likes: 2341,
    comments: 156,
    author: { name: '数码达人', avatar: 'https://i.pravatar.cc/150?u=search1' },
  },
  {
    id: 's2',
    title: 'Sony WH-1000XM5 头戴式耳机',
    description: '行业领先降噪，30小时续航',
    imageUrl: 'https://picsum.photos/seed/sony-search/800/600',
    price: 2999,
    likes: 1823,
    comments: 89,
    author: { name: '音乐发烧友', avatar: 'https://i.pravatar.cc/150?u=search2' },
  },
];

const HISTORY_KEY = 'tiermate_search_history';

export function MobileSearchPage() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // 加载搜索历史
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // 保存搜索历史
  const saveToHistory = useCallback((term: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== term);
      const updated = [term, ...filtered].slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 清除历史
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // 执行搜索
  const handleSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) return;

      setQuery(term);
      setSearching(true);
      setFocused(false);
      saveToHistory(term);

      // 模拟 API 请求
      await new Promise((resolve) => setTimeout(resolve, 800));

      setResults(mockSearchResults);
      setSearching(false);
    },
    [saveToHistory]
  );

  // 清除搜索
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setFocused(true);
  }, []);

  const showSuggestions = focused && !searching && results.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 搜索栏 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="搜索好物..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          {focused && (
            <button
              onClick={() => setFocused(false)}
              className="text-primary-600 text-sm font-medium"
            >
              取消
            </button>
          )}
        </div>
      </div>

      {/* 搜索建议/历史 */}
      {showSuggestions && (
        <div className="px-4 py-4 bg-white">
          {/* 搜索历史 */}
          {history.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  搜索历史
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400"
                >
                  清除
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 active:bg-gray-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4" />
              热门搜索
            </h3>
            <div className="flex flex-wrap gap-2">
              {hotTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="px-3 py-1.5 bg-primary-50 rounded-full text-sm text-primary-600 active:bg-primary-100"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {!showSuggestions && (
        <div className="px-4 py-4">
          {searching ? (
            <ProductCardSkeletonList count={3} />
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                找到 {results.length} 个结果
              </p>
              {results.map((product) => (
                <MobileProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <p className="text-gray-400">未找到相关结果</p>
              <p className="text-sm text-gray-400 mt-1">
                换个关键词试试吧
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
