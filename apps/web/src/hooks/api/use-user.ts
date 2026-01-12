'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  getUserProducts,
  toggleFollow,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getCurrentUser,
} from '@/lib/api/user';
import type { GetUserProductsParams } from '@/types';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  products: (params: GetUserProductsParams) =>
    [...userKeys.all, 'products', params] as const,
  followStatus: (userId: string) => [...userKeys.all, 'followStatus', userId] as const,
  followers: (userId: string) => [...userKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...userKeys.all, 'following', userId] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

/**
 * 获取博主主页完整信息
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30s
  });
}

/**
 * 获取用户发布的产品
 */
export function useUserProducts(params: GetUserProductsParams) {
  return useQuery({
    queryKey: userKeys.products(params),
    queryFn: () => getUserProducts(params),
    enabled: !!params.userId,
    staleTime: 30 * 1000,
  });
}

/**
 * 关注/取消关注用户
 */
export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleFollow(userId),
    onMutate: async () => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: userKeys.profile(userId) });
      const previousProfile = queryClient.getQueryData(userKeys.profile(userId));

      queryClient.setQueryData(userKeys.profile(userId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !old.isFollowing,
          stats: {
            ...old.stats,
            followers: old.isFollowing
              ? old.stats.followers - 1
              : old.stats.followers + 1,
          },
        };
      });

      return { previousProfile };
    },
    onError: (_err, _variables, context) => {
      // 回滚
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.profile(userId), context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.followStatus(userId) });
    },
  });
}

/**
 * 获取关注状态
 */
export function useFollowStatus(userId: string) {
  return useQuery({
    queryKey: userKeys.followStatus(userId),
    queryFn: () => getFollowStatus(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

/**
 * 获取粉丝列表
 */
export function useFollowers(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...userKeys.followers(userId), page, limit],
    queryFn: () => getFollowers(userId, page, limit),
    enabled: !!userId,
  });
}

/**
 * 获取关注列表
 */
export function useFollowing(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...userKeys.following(userId), page, limit],
    queryFn: () => getFollowing(userId, page, limit),
    enabled: !!userId,
  });
}

/**
 * 获取当前登录用户
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: false,
  });
}
