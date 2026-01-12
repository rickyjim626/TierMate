'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getProductDetail,
  toggleLike,
  getProductVideos,
  getProductReviews,
  createProductReview,
  deleteProductReview,
} from '@/lib/api/product';
import type { GetProductsParams, CreateReviewParams } from '@/types';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  list: (params: GetProductsParams) => [...productKeys.all, 'list', params] as const,
  detail: (productId: string) => [...productKeys.all, 'detail', productId] as const,
  videos: (productId: string) => [...productKeys.all, 'videos', productId] as const,
  reviews: (productId: string, page?: number) =>
    [...productKeys.all, 'reviews', productId, page] as const,
};

/**
 * 获取产品列表
 */
export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    staleTime: 30 * 1000,
  });
}

/**
 * 获取产品完整详情
 */
export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductDetail(productId),
    enabled: !!productId,
    staleTime: 30 * 1000,
  });
}

/**
 * 点赞/取消点赞
 */
export function useToggleLike(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleLike(productId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });
      const previousDetail = queryClient.getQueryData(productKeys.detail(productId));

      queryClient.setQueryData(productKeys.detail(productId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !old.isLiked,
          stats: {
            ...old.stats,
            likes: old.isLiked ? old.stats.likes - 1 : old.stats.likes + 1,
          },
        };
      });

      return { previousDetail };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(productKeys.detail(productId), context.previousDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * 获取产品视频
 */
export function useProductVideos(productId: string) {
  return useQuery({
    queryKey: productKeys.videos(productId),
    queryFn: () => getProductVideos(productId),
    enabled: !!productId,
  });
}

/**
 * 获取产品评价
 */
export function useProductReviews(productId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: productKeys.reviews(productId, page),
    queryFn: () => getProductReviews(productId, page, limit),
    enabled: !!productId,
  });
}

/**
 * 创建评价
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateReviewParams) => createProductReview(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.reviews(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}

/**
 * 删除评价
 */
export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteProductReview(productId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.reviews(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}
