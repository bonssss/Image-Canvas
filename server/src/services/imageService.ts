import { db } from '../db';
import { CursorPaginationParams, ImageItem, PaginatedResponse } from '../types';

export class ImageService {
  async getImages(params: CursorPaginationParams, userId?: string): Promise<PaginatedResponse<ImageItem>> {
    return db.getImages(params, userId);
  }

  async getImageById(id: string, userId?: string): Promise<ImageItem | null> {
    const image = await db.getImageById(id, userId);
    if (image) {
      // Async track view count
      db.incrementViews(id, userId).catch(() => {});
    }
    return image;
  }

  async toggleLike(imageId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return db.toggleLike(imageId, userId);
  }

  async trackDownload(imageId: string): Promise<number> {
    return db.incrementDownloads(imageId);
  }

  async getRelatedImages(imageId: string, limit = 8, userId?: string): Promise<ImageItem[]> {
    return db.getRelatedImages(imageId, limit, userId);
  }

  async getLikedImages(userId: string): Promise<ImageItem[]> {
    return db.getLikedImages(userId);
  }
}

export const imageService = new ImageService();
