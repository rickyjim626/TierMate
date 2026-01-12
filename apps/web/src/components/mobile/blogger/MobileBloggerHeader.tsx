'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';

interface MobileBloggerHeaderProps {
  profile: UserProfile;
  isFollowing: boolean;
  onFollowToggle: () => void;
  isLoading?: boolean;
}

export function MobileBloggerHeader({
  profile,
  isFollowing,
  onFollowToggle,
  isLoading,
}: MobileBloggerHeaderProps) {
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="bg-white px-4 py-5">
      <div className="flex items-start gap-4">
        {/* 头像 */}
        <div className="relative">
          <Image
            src={profile.avatar || 'https://i.pravatar.cc/150?u=default'}
            alt={profile.name}
            width={72}
            height={72}
            className="rounded-full border-2 border-gray-100"
          />
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {profile.name}
          </h1>

          {/* 统计数据 */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-gray-600">
              <strong className="text-gray-900">
                {formatNumber(profile.stats.followers)}
              </strong>{' '}
              粉丝
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-900">
                {formatNumber(profile.stats.following)}
              </strong>{' '}
              关注
            </span>
            <span className="text-gray-600">
              <strong className="text-gray-900">
                {formatNumber(profile.stats.likes)}
              </strong>{' '}
              获赞
            </span>
          </div>

          {/* 关注按钮 */}
          <button
            onClick={onFollowToggle}
            disabled={isLoading}
            className={cn(
              'mt-3 px-6 py-1.5 rounded-full text-sm font-medium transition-colors',
              isFollowing
                ? 'bg-gray-100 text-gray-600 active:bg-gray-200'
                : 'bg-primary-600 text-white active:bg-primary-700',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isFollowing ? '已关注' : '+ 关注'}
          </button>
        </div>
      </div>

      {/* 个人简介 */}
      {profile.bio && (
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
      )}
    </div>
  );
}
