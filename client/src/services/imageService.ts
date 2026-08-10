import { api } from './api';
import { ImageItem, PaginatedResponse } from '../types';

export interface GetImagesQuery {
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

export const imageService = {
  async getImages(params: GetImagesQuery): Promise<PaginatedResponse<ImageItem>> {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== 'all')
    );
    const res = await api.get<PaginatedResponse<ImageItem>>('/images', { params: cleanParams });
    return res.data;
  },

  async getImageById(id: string): Promise<ImageItem> {
    const res = await api.get<{ success: boolean; data: ImageItem }>(`/images/${id}`);
    return res.data.data;
  },

  async toggleLike(id: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await api.post<{ success: boolean; data: { isLiked: boolean; likesCount: number } }>(`/images/${id}/like`);
    return res.data.data;
  },

  async trackDownload(id: string): Promise<void> {
    await api.post(`/images/${id}/download`);
  },

  async getRelatedImages(id: string, limit = 8): Promise<ImageItem[]> {
    const res = await api.get<{ success: boolean; data: ImageItem[] }>(`/images/${id}/related`, {
      params: { limit },
    });
    return res.data.data;
  },

  async getLikedImages(): Promise<ImageItem[]> {
    const res = await api.get<{ success: boolean; data: ImageItem[] }>('/images/liked');
    return res.data.data;
  },
};
