'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  Check,
  ImageIcon,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeProductImage, fileToBase64, ProductAnalysisResult } from '@/lib/api/ai';
import { createProduct, getCategories, CreateProductParams } from '@/lib/api/product';
import { Category } from '@/types';

type ShareStep = 'upload' | 'analyzing' | 'edit' | 'submitting' | 'success';

export default function SharePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [step, setStep] = useState<ShareStep>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ProductAnalysisResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [createdProductId, setCreatedProductId] = useState<string>('');

  // Form state (editable by user)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    categoryId: '',
    price: '',
    description: '',
    tags: [] as string[],
    review: '',
  });

  // Load categories on mount
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/share');
    }
  }, [user, authLoading, router]);

  // Handle image selection
  const handleImageSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB');
      return;
    }

    setError('');
    setImageFile(file);

    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  }, []);

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  // Analyze image with AI
  const handleAnalyze = async () => {
    if (!imageFile) return;

    setStep('analyzing');
    setError('');

    try {
      const base64 = await fileToBase64(imageFile);
      const response = await analyzeProductImage(base64, imageFile.type);

      if (!response.success || !response.data) {
        throw new Error(response.error || '分析失败');
      }

      const result = response.data;
      setAnalysisResult(result);

      // Find matching category ID
      const matchedCategory = categories.find(
        (c) => c.name === result.category || c.name.includes(result.category)
      );

      // Pre-fill form with AI results
      setFormData({
        title: result.title,
        brand: result.brand,
        categoryId: matchedCategory?.id || '',
        price: result.suggestedPrice?.toString() || '',
        description: result.description,
        tags: result.tags,
        review: '',
      });

      setStep('edit');
    } catch (err: any) {
      setError(err.message || '分析失败，请重试');
      setStep('upload');
    }
  };

  // Submit product
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      setError('请填写产品名称');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('请填写产品描述（至少10个字符）');
      return;
    }

    setStep('submitting');
    setError('');

    try {
      const params: CreateProductParams = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim() || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        categoryId: formData.categoryId || undefined,
        images: imagePreview ? [imagePreview] : [], // For now, using preview URL
        tags: formData.tags,
      };

      const product = await createProduct(params);
      setCreatedProductId(product.id);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '发布失败');
      setStep('edit');
    }
  };

  // Handle tag input
  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </Link>
          <h1 className="text-lg font-semibold">分享好物</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['upload', 'analyzing', 'edit', 'submitting', 'success'].map((s, i) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                step === s
                  ? 'bg-primary-500'
                  : ['upload', 'analyzing', 'edit', 'submitting', 'success'].indexOf(step) > i
                  ? 'bg-primary-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI 智能识图</h2>
              <p className="text-gray-600">
                上传商品截图，AI 自动识别产品信息
              </p>
            </div>

            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                imagePreview
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={300}
                    height={300}
                    className="rounded-lg max-h-64 w-auto object-contain mx-auto"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">拖拽图片到这里，或</p>
                  <label className="inline-block">
                    <span className="px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
                      选择图片
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                    />
                  </label>
                  <p className="text-sm text-gray-400 mt-4">
                    支持 JPG、PNG、WebP，最大 10MB
                  </p>
                </>
              )}
            </div>

            {/* Next button */}
            {imagePreview && (
              <button
                onClick={handleAnalyze}
                className="w-full mt-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                开始 AI 识别
              </button>
            )}
          </div>
        )}

        {/* Step: Analyzing */}
        {step === 'analyzing' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-primary-200 rounded-full animate-pulse" />
              <div className="absolute inset-2 border-4 border-primary-400 rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI 正在分析...</h2>
            <p className="text-gray-600">正在识别产品信息，请稍候</p>
          </div>
        )}

        {/* Step: Edit */}
        {step === 'edit' && (
          <div className="space-y-6">
            {/* AI Confidence */}
            {analysisResult && (
              <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl p-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-gray-700">
                  AI 识别置信度: {Math.round((analysisResult.confidence || 0) * 100)}%
                </span>
                <span className="text-sm text-gray-500">· 请检查并修改以下信息</span>
              </div>
            )}

            {/* Image preview */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start gap-4">
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt="Product"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    产品名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="输入产品名称"
                  />
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="输入品牌名称"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签（最多5个）
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {formData.tags.length < 5 && (
                  <input
                    type="text"
                    placeholder="输入标签后按回车添加"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        handleAddTag(input.value.trim());
                        input.value = '';
                      }
                    }}
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品描述 *（至少10个字符）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="描述产品特点、使用体验..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.description.length}/2000
                </p>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              发布分享
            </button>
          </div>
        )}

        {/* Step: Submitting */}
        {step === 'submitting' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">正在发布...</h2>
            <p className="text-gray-600">请稍候</p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">发布成功！</h2>
            <p className="text-gray-600 mb-6">你的好物分享已成功发布</p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/product/${createdProductId}`}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                查看详情
              </Link>
              <Link
                href="/"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
