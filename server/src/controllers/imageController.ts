import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { imageService } from '../services/imageService';
import { aiGenerationService } from '../services/aiGenerationService';
import { CursorPaginationParams } from '../types';

export class ImageController {
  async getImages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        cursor,
        limit,
        sort,
        category,
        style,
        color,
        search,
        userId,
        aspectRatio,
      } = req.query as Record<string, string>;

      const params: CursorPaginationParams = {
        cursor: cursor || undefined,
        limit: limit ? parseInt(limit, 10) : 20,
        sort: (sort as any) || 'trending',
        category: category || undefined,
        style: style || undefined,
        color: color || undefined,
        search: search || undefined,
        userId: userId || undefined,
        aspectRatio: aspectRatio || undefined,
      };

      const result = await imageService.getImages(params, req.user?.id);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getImageById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const image = await imageService.getImageById(id, req.user?.id);

      if (!image) {
        res.status(404).json({ success: false, error: 'Image not found' });
        return;
      }

      res.json({ success: true, data: image });
    } catch (err) {
      next(err);
    }
  }

  async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id || 'u-101';
      const result = await imageService.toggleLike(id, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async trackDownload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const downloadsCount = await imageService.trackDownload(id);
      res.json({ success: true, data: { downloadsCount } });
    } catch (err) {
      next(err);
    }
  }

  async getRelatedImages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const related = await imageService.getRelatedImages(id, limit, req.user?.id);
      res.json({ success: true, data: related });
    } catch (err) {
      next(err);
    }
  }

  async getLikedImages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'u-101';
      const liked = await imageService.getLikedImages(userId);
      res.json({ success: true, data: liked });
    } catch (err) {
      next(err);
    }
  }

  async generateImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || 'u-101';
      const generated = await aiGenerationService.generate(req.body, userId);

      res.status(201).json({
        success: true,
        data: generated,
        message: `Successfully generated ${generated.length} image(s)`,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const imageController = new ImageController();
