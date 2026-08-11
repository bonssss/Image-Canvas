import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { Collection, ImageItem } from '../types';

export class CollectionService {
  async getCollections(userId?: string): Promise<Collection[]> {
    return db.getCollections(userId);
  }

  async getCollectionById(id: string, userId?: string): Promise<{ collection: Collection; images: ImageItem[] } | null> {
    return db.getCollectionById(id, userId);
  }

  async createCollection(
    data: { title: string; description?: string; isPrivate?: boolean },
    userId: string
  ): Promise<Collection> {
    const newCollection: Collection = {
      id: `col-${uuidv4()}`,
      title: data.title,
      description: data.description || '',
      isPrivate: data.isPrivate ?? false,
      userId,
      imagesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return db.createCollection(newCollection);
  }

  async updateCollection(id: string, updates: Partial<Collection>, userId: string): Promise<Collection> {
    return db.updateCollection(id, updates, userId);
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    return db.deleteCollection(id, userId);
  }

  async addImage(collectionId: string, imageId: string, userId: string): Promise<boolean> {
    return db.saveImageToCollection(collectionId, imageId, userId);
  }

  async removeImage(collectionId: string, imageId: string, userId: string): Promise<boolean> {
    return db.removeImageFromCollection(collectionId, imageId, userId);
  }

  async getUserCollectionsForImage(userId: string, imageId: string): Promise<string[]> {
    return db.getUserCollectionIdsForImage(userId, imageId);
  }
}

export const collectionService = new CollectionService();
