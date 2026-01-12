'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Settings,
  Heart,
  Bookmark,
  FileText,
  ChevronRight,
  LogOut,
  Bell,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  stats: {
    posts: number;
    likes: number;
    collected: number;
    followers: number;
    following: number;
  };
}

const mockUser: UserProfile = {
  id: 'u1',
  name: '好物分享官',
  avatar: 'https://i.pravatar.cc/150?u=profile',
  bio: '分享美好生活，发现优质好物 ✨',
  stats: {
    posts: 28,
    likes: 1256,
    collected: 342,
    followers: 8920,
    following: 156,
  },
};

const menuItems = [
  {
    icon: Heart,
    label: '我的点赞',
    href: '/profile/likes',
    color: 'text-red-500',
  },
  {
    icon: Bookmark,
    label: '我的收藏',
    href: '/profile/collections',
    color: 'text-yellow-500',
  },
  {
    icon: FileText,
    label: '我的发布',
    href: '/profile/posts',
    color: 'text-blue-500',
  },
  {
    icon: Bell,
    label: '消息通知',
    href: '/profile/notifications',
    color: 'text-purple-500',
  },
];

const settingsItems = [
  {
    icon: Settings,
    label: '设置',
    href: '/profile/settings',
  },
  {
    icon: Shield,
    label: '隐私',
    href: '/profile/privacy',
  },
  {
    icon: HelpCircle,
    label: '帮助与反馈',
    href: '/profile/help',
  },
];

interface MobileProfilePageProps {
  user?: UserProfile | null;
  onLogout?: () => void;
}

export function MobileProfilePage({
  user = mockUser,
  onLogout,
}: MobileProfilePageProps) {
  // 如果没有用户数据，显示登录提示
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
          <Image
            src="https://i.pravatar.cc/150?u=guest"
            alt="Guest"
            width={96}
            height={96}
            className="rounded-full opacity-50"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          登录后查看更多
        </h2>
        <p className="text-gray-500 text-center mb-8">
          登录后可以收藏好物、关注达人、发布分享
        </p>
        <Link
          href="/auth"
          className="w-full bg-primary-600 text-white py-3 rounded-full text-center font-medium active:bg-primary-700"
        >
          立即登录
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 pt-safe">
        <div className="px-6 py-8">
          <div className="flex items-start gap-4">
            <Image
              src={user.avatar}
              alt={user.name}
              width={72}
              height={72}
              className="rounded-full border-3 border-white shadow-lg"
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-primary-100 text-sm">{user.bio}</p>
            </div>
            <Link
              href="/profile/edit"
              className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm"
            >
              编辑
            </Link>
          </div>

          {/* 统计数据 */}
          <div className="flex justify-around mt-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {user.stats.posts}
              </p>
              <p className="text-xs text-primary-100">发布</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {user.stats.followers.toLocaleString()}
              </p>
              <p className="text-xs text-primary-100">粉丝</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {user.stats.following}
              </p>
              <p className="text-xs text-primary-100">关注</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {user.stats.likes.toLocaleString()}
              </p>
              <p className="text-xs text-primary-100">获赞</p>
            </div>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-4 active:bg-gray-50',
                index !== menuItems.length - 1 && 'border-b border-gray-100'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center',
                  item.color
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-gray-900">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* 设置菜单 */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {settingsItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-4 active:bg-gray-50',
                index !== settingsItems.length - 1 && 'border-b border-gray-100'
              )}
            >
              <item.icon className="w-5 h-5 text-gray-500" />
              <span className="flex-1 text-gray-900">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* 退出登录 */}
      <div className="px-4 mt-4">
        <button
          onClick={onLogout}
          className="w-full bg-white rounded-2xl shadow-sm py-4 flex items-center justify-center gap-2 text-red-500 active:bg-gray-50"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>

      {/* 版本信息 */}
      <p className="text-center text-xs text-gray-400 mt-6">
        TierMate v1.0.0
      </p>
    </div>
  );
}
