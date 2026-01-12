// 用户相关类型
export interface User {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  email?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  stats: {
    products: number;
    followers: number;
    following: number;
    likes: number;
  };
  categoryStats: CategoryStat[];
  isFollowing?: boolean;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  count: number;
}

// 分类相关类型
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
}

// 产品相关类型
export interface Product {
  id: string;
  title: string;
  description: string;
  content: string | null;
  imageUrl: string;
  images: string[];
  price: number | null;
  purchaseUrl: string | null;
  tags: string[];
  categoryId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: Category | null;
  _count?: {
    likes: number;
    comments: number;
    reviews?: number;
  };
}

export interface ProductDetail extends Omit<Product, '_count'> {
  author: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    _count?: {
      followers: number;
    };
  };
  videos: ProductVideo[];
  stats: {
    likes: number;
    comments: number;
    reviews: number;
  };
  reviewSummary: {
    averageRating: number;
    totalReviews: number;
  };
  isLiked: boolean;
}

// 产品视频
export interface ProductVideo {
  id: string;
  productId: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  title: string | null;
  createdAt: string;
}

// 产品评价
export interface ProductReview {
  id: string;
  productId: string;
  authorId: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

// 关注关系
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

// 分页相关
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface ReviewsResponse extends PaginatedResponse<ProductReview> {
  summary: ReviewSummary;
}

// API 请求参数类型
export interface GetUserProductsParams {
  userId: string;
  page?: number;
  limit?: number;
  categoryId?: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export interface CreateReviewParams {
  productId: string;
  rating: number;
  content: string;
  images?: string[];
}

export interface UpdateReviewParams {
  reviewId: string;
  rating?: number;
  content?: string;
  images?: string[];
}

export interface CreateVideoParams {
  productId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  title?: string;
}
