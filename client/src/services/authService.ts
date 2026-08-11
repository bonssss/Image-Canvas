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
    password?: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/register', payload);
    return res.data.data;
  },

  async login(emailOrUsername: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/login', { emailOrUsername, password });
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

  async updateProfilePhoto(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const res = await api.post('/auth/profile-photo', formData);
    return res.data.data;
  },

  async forgotPassword(email: string): Promise<{ testToken?: string }> {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data.data; // Includes testToken if returned
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { email, token, newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  }
};
