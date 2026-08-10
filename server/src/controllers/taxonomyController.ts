import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export class TaxonomyController {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await db.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  async getStyles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const styles = await db.getStyles();
      res.json({ success: true, data: styles });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await db.getCategories();
      const styles = await db.getStyles();
      const collections = await db.getCollections();
      const images = await db.getImages({ limit: 1 });

      res.json({
        success: true,
        data: {
          totalImages: images.pagination.total || 0,
          totalCategories: categories.length,
          totalStyles: styles.length,
          totalCollections: collections.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const taxonomyController = new TaxonomyController();
