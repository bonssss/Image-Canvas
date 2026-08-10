export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  coverImageUrl?: string;
  imagesCount?: number;
}

export interface Style {
  id: string;
  name: string;
  slug: string;
  promptModifier: string;
  previewUrl?: string;
  imagesCount?: number;
}

export interface ImageItem {
  id: string;
  title: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: string; // '1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '21:9'
  dominantColor: string;
  palette: string[];
  model: string;
  seed?: number;
  guidanceScale?: number;
  steps?: number;
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  downloadsCount: number;
  isFeatured: boolean;
  userId?: string;
  creator?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  styleId?: string;
  style?: {
    id: string;
    name: string;
    slug: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  userId: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  coverImageId?: string;
  coverImage?: ImageItem;
  previewImages?: ImageItem[]; // For 3-image collage card preview (Unsplash style)
  imagesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  sort?: 'trending' | 'newest' | 'likes' | 'views';
  category?: string;
  style?: string;
  color?: string;
  search?: string;
  userId?: string;
  aspectRatio?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    total?: number;
    limit: number;
  };
}

export interface GenerateImagePayload {
  prompt: string;
  negativePrompt?: string;
  styleSlug?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | '3:4' | '21:9';
  categorySlug?: string;
  seed?: number;
  numImages?: number; // 1, 2, 4
  guidanceScale?: number;
  steps?: number;
  model?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
