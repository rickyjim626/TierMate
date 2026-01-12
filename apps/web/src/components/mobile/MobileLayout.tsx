'use client';

import { MobileTabBar } from './MobileTabBar';
import { MobileHeader } from './MobileHeader';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  showTabBar?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerShowBack?: boolean;
  headerShowShare?: boolean;
  headerTransparent?: boolean;
  onShare?: () => void;
  className?: string;
}

export function MobileLayout({
  children,
  showTabBar = true,
  showHeader = false,
  headerTitle,
  headerShowBack = false,
  headerShowShare = false,
  headerTransparent = false,
  onShare,
  className,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <MobileHeader
          title={headerTitle}
          showBack={headerShowBack}
          showShare={headerShowShare}
          transparent={headerTransparent}
          onShare={onShare}
        />
      )}

      <main
        className={cn(
          'overscroll-contain scroll-smooth-ios',
          showHeader && 'pt-14 pt-safe',
          showTabBar && 'pb-20 pb-safe',
          className
        )}
      >
        {children}
      </main>

      {showTabBar && <MobileTabBar />}
    </div>
  );
}
