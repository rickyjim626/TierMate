import { api } from '../api';
import type {
  UserProfile,
  User,
  PaginatedResponse,
  Product,
  GetUserProductsParams,
} from '@/types';

/**
 * 获取用户基本信息
 */
export async function getUser(userId: string): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
}

/**
 * 获取博主主页完整信息（含分类统计）
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`/users/${userId}/profile`);
  return response.data;
}

/**
 * 获取用户发布的产品（支持分类筛选）
 */
export async function getUserProducts({
  userId,
  page = 1,
  limit = 10,
  categoryId,
}: GetUserProductsParams): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (categoryId) {
    params.append('categoryId', categoryId);
  }
  const response = await api.get<PaginatedResponse<Product>>(
    `/users/${userId}/products?${params.toString()}`
  );
  return response.data;
}

/**
 * 关注/取消关注用户（toggle）
 */
export async function toggleFollow(userId: string): Promise<{ following: boolean }> {
  const response = await api.post<{ following: boolean }>(`/users/${userId}/follow`);
  return response.data;
}

/**
 * 检查是否已关注该用户
 */
export async function getFollowStatus(userId: string): Promise<{ following: boolean }> {
  const response = await api.get<{ following: boolean }>(
    `/users/${userId}/follow-status`
  );
  return response.data;
}

/**
 * 获取用户的粉丝列表
 */
export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<User>> {
  const response = await api.get<PaginatedResponse<User>>(
    `/users/${userId}/followers?page=${page}&limit=${limit}`
  );
  return response.data;
}

/**
 * 获取用户的关注列表
 */
export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<User>> {
  const response = await api.get<PaginatedResponse<User>>(
    `/users/${userId}/following?page=${page}&limit=${limit}`
  );
  return response.data;
}

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/users/me');
  return response.data;
}
