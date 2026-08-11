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
      db.trackImageView(id, userId).catch(() => {});
    }
    return image;
  }

  async toggleLike(imageId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    return db.toggleLike(imageId, userId);
  }

  async trackDownload(imageId: string): Promise<number> {
    // Add logic for tracking downloads, or just reuse views since we don't have downloads tracking yet
    return 0; // Return a dummy count for now
  }

  async getRelatedImages(imageId: string, limit = 8, userId?: string): Promise<ImageItem[]> {
    return db.getRelatedImages(imageId, limit, userId);
  }

  async getLikedImages(userId: string): Promise<ImageItem[]> {
    return db.getLikedImages(userId);
  }

  async addUploadedImage(image: ImageItem): Promise<void> {
    return db.addGeneratedImages([image]);
  }
}

export const imageService = new ImageService();
