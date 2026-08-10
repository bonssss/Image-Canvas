import { api } from './api';
import { Collection, ImageItem } from '../types';

export const collectionService = {
  async getCollections(): Promise<Collection[]> {
    const res = await api.get<{ success: boolean; data: Collection[] }>('/collections');
    return res.data.data;
  },

  async getCollectionById(id: string): Promise<{ collection: Collection; images: ImageItem[] }> {
    const res = await api.get<{ success: boolean; data: Collection; images: ImageItem[] }>(`/collections/${id}`);
    return {
      collection: res.data.data,
      images: res.data.images || [],
    };
  },

  async createCollection(data: { title: string; description?: string; isPrivate?: boolean }): Promise<Collection> {
    const res = await api.post<{ success: boolean; data: Collection }>('/collections', data);
    return res.data.data;
  },

  async updateCollection(id: string, data: { title?: string; description?: string; isPrivate?: boolean }): Promise<Collection> {
    const res = await api.patch<{ success: boolean; data: Collection }>(`/collections/${id}`, data);
    return res.data.data;
  },

  async deleteCollection(id: string): Promise<void> {
    await api.delete(`/collections/${id}`);
  },

  async addImageToCollection(collectionId: string, imageId: string): Promise<void> {
    await api.post(`/collections/${collectionId}/images`, { imageId });
  },

  async removeImageFromCollection(collectionId: string, imageId: string): Promise<void> {
    await api.delete(`/collections/${collectionId}/images/${imageId}`);
  },

  async getSavedCollectionIdsForImage(imageId: string): Promise<string[]> {
    const res = await api.get<{ success: boolean; data: string[] }>(`/collections/saved-status/${imageId}`);
    return res.data.data;
  },
};
