import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { collectionService } from '../services/collectionService';

export class CollectionController {
  async getCollections(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await collectionService.getCollections(req.user?.id);
      res.json({ success: true, data: collections });
    } catch (err) {
      next(err);
    }
  }

  async getCollectionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await collectionService.getCollectionById(id, req.user?.id);

      if (!result) {
        res.status(404).json({ success: false, error: 'Collection not found' });
        return;
      }

      res.json({
        success: true,
        data: result.collection,
        images: result.images,
      });
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: 'This collection is private' });
        return;
      }
      next(err);
    }
  }

  async createCollection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'u-101';
      const collection = await collectionService.createCollection(req.body, userId);
      res.status(201).json({ success: true, data: collection });
    } catch (err) {
      next(err);
    }
  }

  async updateCollection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id || 'u-101';
      const collection = await collectionService.updateCollection(id, req.body, userId);
      res.json({ success: true, data: collection });
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: 'You do not own this collection' });
        return;
      }
      next(err);
    }
  }

  async deleteCollection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id || 'u-101';
      const deleted = await collectionService.deleteCollection(id, userId);

      if (!deleted) {
        res.status(404).json({ success: false, error: 'Collection not found' });
        return;
      }

      res.json({ success: true, message: 'Collection deleted successfully' });
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: 'You do not own this collection' });
        return;
      }
      next(err);
    }
  }

  async addImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { imageId } = req.body;
      const userId = req.user?.id || 'u-101';

      if (!imageId) {
        res.status(400).json({ success: false, error: 'Image ID is required' });
        return;
      }

      await collectionService.addImage(id, String(imageId), userId);
      res.json({ success: true, message: 'Image added to collection' });
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: 'You do not own this collection' });
        return;
      }
      next(err);
    }
  }

  async removeImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const imageId = String(req.params.imageId);
      const userId = req.user?.id || 'u-101';

      await collectionService.removeImage(id, imageId, userId);
      res.json({ success: true, message: 'Image removed from collection' });
    } catch (err: any) {
      if (err.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: 'You do not own this collection' });
        return;
      }
      next(err);
    }
  }

  async getSavedCollectionsForImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const imageId = String(req.params.imageId);
      const userId = req.user?.id || 'u-101';
      const collectionIds = await collectionService.getUserCollectionsForImage(userId, imageId);
      res.json({ success: true, data: collectionIds });
    } catch (err) {
      next(err);
    }
  }
}

export const collectionController = new CollectionController();
