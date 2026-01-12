import { api } from '../api';
import type {
  Product,
  ProductDetail,
  ProductVideo,
  ProductReview,
  PaginatedResponse,
  ReviewsResponse,
  GetProductsParams,
  CreateReviewParams,
  UpdateReviewParams,
  CreateVideoParams,
  Category,
} from '@/types';

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/categories');
  return response.data;
}

/**
 * 获取产品列表
 */
export async function getProducts({
  page = 1,
  limit = 10,
  categoryId,
  search,
}: GetProductsParams = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (categoryId) {
    params.append('categoryId', categoryId);
  }
  if (search) {
    params.append('search', search);
  }
  const response = await api.get<PaginatedResponse<Product>>(
    `/products?${params.toString()}`
  );
  return response.data;
}

/**
 * 获取产品基本信息
 */
export async function getProduct(productId: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${productId}`);
  return response.data;
}

/**
 * 获取产品完整详情（含视频、评价摘要）
 */
export async function getProductDetail(productId: string): Promise<ProductDetail> {
  const response = await api.get<ProductDetail>(`/products/${productId}/detail`);
  return response.data;
}

/**
 * 点赞/取消点赞
 */
export async function toggleLike(productId: string): Promise<{ liked: boolean }> {
  const response = await api.post<{ liked: boolean }>(`/products/${productId}/like`);
  return response.data;
}

/**
 * 检查是否已点赞
 */
export async function checkLiked(productId: string): Promise<{ liked: boolean }> {
  const response = await api.get<{ liked: boolean }>(`/products/${productId}/liked`);
  return response.data;
}

// ========== 视频相关 ==========

/**
 * 获取产品视频列表
 */
export async function getProductVideos(productId: string): Promise<ProductVideo[]> {
  const response = await api.get<ProductVideo[]>(`/products/${productId}/videos`);
  return response.data;
}

/**
 * 添加产品视频
 */
export async function addProductVideo({
  productId,
  videoUrl,
  thumbnailUrl,
  duration,
  title,
}: CreateVideoParams): Promise<ProductVideo> {
  const response = await api.post<ProductVideo>(`/products/${productId}/videos`, {
    videoUrl,
    thumbnailUrl,
    duration,
    title,
  });
  return response.data;
}

/**
 * 删除产品视频
 */
export async function deleteProductVideo(
  productId: string,
  videoId: string
): Promise<void> {
  await api.delete(`/products/${productId}/videos/${videoId}`);
}

// ========== 评价相关 ==========

/**
 * 获取产品评价列表（含评分统计）
 */
export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> {
  const response = await api.get<ReviewsResponse>(
    `/products/${productId}/reviews?page=${page}&limit=${limit}`
  );
  return response.data;
}

/**
 * 发布产品评价
 */
export async function createProductReview({
  productId,
  rating,
  content,
  images,
}: CreateReviewParams): Promise<ProductReview> {
  const response = await api.post<ProductReview>(`/products/${productId}/reviews`, {
    rating,
    content,
    images,
  });
  return response.data;
}

/**
 * 更新产品评价
 */
export async function updateProductReview(
  productId: string,
  { reviewId, ...data }: UpdateReviewParams
): Promise<ProductReview> {
  const response = await api.patch<ProductReview>(
    `/products/${productId}/reviews/${reviewId}`,
    data
  );
  return response.data;
}

/**
 * 删除产品评价
 */
export async function deleteProductReview(
  productId: string,
  reviewId: string
): Promise<void> {
  await api.delete(`/products/${productId}/reviews/${reviewId}`);
}
