import { api } from './api';
import { User, ImageItem, Collection } from '../types';

export interface UserProfileData {
  user: User;
  stats: {
    createdCount: number;
    collectionsCount: number;
    likesCount: number;
  };
  createdImages: ImageItem[];
  collections: Collection[];
  likedImages: ImageItem[];
}

export const authService = {
  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async register(payload: {
    email: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<User> {
    const res = await api.post('/auth/register', payload);
    return res.data.data;
  },

  async login(emailOrUsername: string): Promise<User> {
    const res = await api.post('/auth/login', { emailOrUsername });
    return res.data.data;
  },

  async syncProfile(userData: Partial<User>): Promise<User> {
    const res = await api.post('/auth/sync', userData);
    return res.data.data;
  },

  async getAllUsers(): Promise<User[]> {
    const res = await api.get('/auth/users');
    return res.data.data;
  },

  async getUserProfile(identifier: string): Promise<UserProfileData> {
    const res = await api.get(`/auth/profile/${identifier}`);
    return res.data.data;
  },
};
