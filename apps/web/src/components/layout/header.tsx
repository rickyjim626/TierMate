'use client';

import Link from 'next/link';
import { Search, User, Plus } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">
              TierMate
            </span>
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索好物..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/share"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>分享好物</span>
            </Link>
            <Link
              href="/profile"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
