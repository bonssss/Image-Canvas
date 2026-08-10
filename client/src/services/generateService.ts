import { api } from './api';
import { GenerateImagePayload, ImageItem, Category, Style, User } from '../types';

export const generateService = {
  async generateImages(payload: GenerateImagePayload): Promise<ImageItem[]> {
    const res = await api.post<{ success: boolean; data: ImageItem[]; message?: string }>(
      '/images/generate',
      payload
    );
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get<{ success: boolean; data: Category[] }>('/categories');
    return res.data.data;
  },

  async getStyles(): Promise<Style[]> {
    const res = await api.get<{ success: boolean; data: Style[] }>('/styles');
    return res.data.data;
  },

  async getStats(): Promise<{
    totalImages: number;
    totalCategories: number;
    totalStyles: number;
    totalCollections: number;
  }> {
    const res = await api.get<{ success: boolean; data: any }>('/stats');
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },

  async getDemoUsers(): Promise<User[]> {
    const res = await api.get<{ success: boolean; data: User[] }>('/auth/demo-users');
    return res.data.data;
  },

  async syncProfile(userData: Partial<User>): Promise<User> {
    const res = await api.post<{ success: boolean; data: User }>('/auth/sync', userData);
    return res.data.data;
  },
};
