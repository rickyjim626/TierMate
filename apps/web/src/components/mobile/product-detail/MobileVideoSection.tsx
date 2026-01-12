'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileVideoPlayer } from './MobileVideoPlayer';
import type { ProductVideo } from '@/types';

interface MobileVideoSectionProps {
  videos: ProductVideo[];
  className?: string;
}

export function MobileVideoSection({ videos, className }: MobileVideoSectionProps) {
  const [activeVideo, setActiveVideo] = useState<ProductVideo | null>(
    videos.length > 0 ? videos[0] : null
  );

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-white', className)}>
      {/* 区块标题 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Video className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">视频评价</h3>
        <span className="text-sm text-gray-400">({videos.length})</span>
      </div>

      {/* 当前视频播放器 */}
      {activeVideo && (
        <div className="px-4 pt-3">
          <MobileVideoPlayer
            src={activeVideo.videoUrl}
            poster={activeVideo.thumbnailUrl || undefined}
            title={activeVideo.title || undefined}
          />
        </div>
      )}

      {/* 视频列表缩略图 */}
      {videos.length > 1 && (
        <div className="flex overflow-x-auto scrollbar-hide gap-3 px-4 py-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className={cn(
                'relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden',
                activeVideo?.id === video.id && 'ring-2 ring-primary-600'
              )}
            >
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title || '视频封面'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {/* 时长标签 */}
              {video.duration && (
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
