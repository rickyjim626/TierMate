'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, X, Plus, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCategories } from '@/lib/api/product';
import { cn } from '@/lib/utils';
import { MobileLayout } from '@/components/mobile';

const MAX_IMAGES = 9;

export default function PublishPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表单状态
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 获取分类列表
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // 未登录重定向
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user, router]);

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    // 清空 input 以便重复选择同一文件
    e.target.value = '';
  };

  // 删除图片
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 添加标签
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  // 删除标签
  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // 提交表单
  const handleSubmit = async () => {
    // 验证
    if (images.length === 0) {
      toast({ title: '请至少上传一张图片', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: '请输入标题', variant: 'destructive' });
      return;
    }
    if (!description.trim()) {
      toast({ title: '请输入描述', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      // TODO: 实现真实的 API 调用
      // 1. 先上传图片到对象存储
      // 2. 然后调用创建产品 API

      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({ title: '发布成功！', description: '你的好物已成功分享' });
      router.push('/');
    } catch (error) {
      toast({
        title: '发布失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // 内容区域
  const content = (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">发布好物</h1>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              submitting
                ? 'bg-gray-200 text-gray-400'
                : 'bg-primary-600 text-white active:bg-primary-700'
            )}
          >
            {submitting ? '发布中...' : '发布'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 图片上传区域 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              添加图片 <span className="text-red-500">*</span>
            </span>
            <span className="text-xs text-gray-400">{images.length}/{MAX_IMAGES}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={img}
                  alt={`图片 ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                    封面
                  </div>
                )}
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 active:bg-gray-50"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">添加</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给你的好物起个名字"
            maxLength={50}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <div className="mt-1 text-xs text-gray-400 text-right">{title.length}/50</div>
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="分享你的使用体验、推荐理由..."
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <div className="mt-1 text-xs text-gray-400 text-right">{description.length}/500</div>
        </div>

        {/* 分类选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(categoryId === cat.id ? '' : cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  categoryId === cat.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                )}
                style={{
                  backgroundColor: categoryId === cat.id ? (cat.color || '#ea580c') : undefined,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            添加标签 <span className="text-xs text-gray-400 font-normal">(最多5个)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-primary-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="输入标签后回车添加"
                maxLength={20}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm active:bg-gray-200 disabled:opacity-50"
              >
                添加
              </button>
            </div>
          )}
        </div>

        {/* 价格 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            参考价格 <span className="text-xs text-gray-400 font-normal">(选填)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* 购买链接 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            购买链接 <span className="text-xs text-gray-400 font-normal">(选填)</span>
          </label>
          <input
            type="url"
            value={purchaseUrl}
            onChange={(e) => setPurchaseUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* 底部间距 */}
        <div className="h-20" />
      </div>
    </div>
  );

  // 移动端使用 MobileLayout
  if (isMobile) {
    return (
      <MobileLayout showTabBar={false} showHeader={false}>
        {content}
      </MobileLayout>
    );
  }

  // 桌面端直接渲染
  return content;
}
