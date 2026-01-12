'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout, MobileProfilePage } from '@/components/mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Settings, Heart, Bookmark, FileText, LogOut, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (isMobile) {
    return (
      <MobileLayout showTabBar={true} showHeader={false}>
        <MobileProfilePage
          user={user}
          isLoading={loading}
          onLogout={handleLogout}
        />
      </MobileLayout>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">个人中心</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-6">请登录查看个人信息</p>
            <Link
              href="/auth"
              className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show profile
  const displayName = user.display_name || user.username || user.email?.split('@')[0] || '用户';
  const avatarUrl = user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">个人中心</h1>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-6">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {displayName}
              </h2>
              <p className="text-gray-500">{user.email || '未绑定邮箱'}</p>
            </div>
            <Link
              href="/profile/edit"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              编辑资料
            </Link>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg shadow divide-y">
          <Link href="/profile/likes" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="flex-1 text-gray-900">我的点赞</span>
          </Link>
          <Link href="/profile/collections" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <Bookmark className="w-5 h-5 text-yellow-500" />
            <span className="flex-1 text-gray-900">我的收藏</span>
          </Link>
          <Link href="/profile/posts" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="flex-1 text-gray-900">我的发布</span>
          </Link>
          <Link href="/profile/settings" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="flex-1 text-gray-900">设置</span>
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-white rounded-lg shadow p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  );
}
