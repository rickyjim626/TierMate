'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TabItem {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
}

const tabs: TabItem[] = [
  { id: 'discover', label: '发现', icon: Home, href: '/' },
  { id: 'search', label: '搜索', icon: Search, href: '/search' },
  { id: 'favorites', label: '收藏', icon: Heart, href: '/favorites' },
  { id: 'profile', label: '我的', icon: User, href: '/profile' },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 获取用户头像
  const displayName = user?.display_name || user?.username || user?.email?.split('@')[0] || '用户';
  const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe tap-transparent">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          // 个人中心 Tab 特殊处理：显示用户头像
          if (tab.id === 'profile') {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full touch-target touch-active',
                  isActive ? 'text-primary-600' : 'text-gray-500'
                )}
              >
                {user ? (
                  <div
                    className={cn(
                      'w-6 h-6 mb-1 rounded-full overflow-hidden transition-transform',
                      isActive && 'scale-110 ring-2 ring-primary-600'
                    )}
                  >
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Icon
                    className={cn(
                      'w-6 h-6 mb-1 transition-transform',
                      isActive && 'scale-110'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                )}
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full touch-target touch-active',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )}
            >
              <Icon
                className={cn(
                  'w-6 h-6 mb-1 transition-transform',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
