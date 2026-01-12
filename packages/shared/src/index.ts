// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

export interface UserProfile extends Pick<User, 'id' | 'name' | 'avatar' | 'bio'> {}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

// Product types
export interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  purchaseUrl?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  author: UserProfile;
  category?: Category;
  likesCount: number;
  commentsCount: number;
}

export interface ProductListItem extends Omit<Product, 'description'> {
  description: string;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: UserProfile;
  replies?: Comment[];
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: UserProfile;
}

export interface RegisterResponse extends AuthTokens {
  user: UserProfile;
}

// API Response types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price?: number;
  purchaseUrl?: string;
  categoryId?: string;
  images?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateCommentRequest {
  content: string;
  productId: string;
  parentId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
}

// Query params
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}
