import { Router } from 'express';
import { imageController } from '../controllers/imageController';
import { authenticate } from '../middlewares/authMiddleware';
import { generationRateLimiter } from '../middlewares/rateLimiter';
import { validate, generateImageSchema } from '../middlewares/validation';

const router = Router();

// Browse & Discover with cursor pagination & filters
router.get('/', authenticate, (req, res, next) => imageController.getImages(req, res, next));

// Liked images for current user
router.get('/liked', authenticate, (req, res, next) => imageController.getLikedImages(req, res, next));

// Image details
router.get('/:id', authenticate, (req, res, next) => imageController.getImageById(req, res, next));

// Related images
router.get('/:id/related', authenticate, (req, res, next) => imageController.getRelatedImages(req, res, next));

// Like / Unlike
router.post('/:id/like', authenticate, (req, res, next) => imageController.toggleLike(req, res, next));

// Track download
router.post('/:id/download', authenticate, (req, res, next) => imageController.trackDownload(req, res, next));

// AI Image Generation
router.post(
  '/generate',
  authenticate,
  generationRateLimiter,
  validate(generateImageSchema),
  (req, res, next) => imageController.generateImage(req, res, next)
);

export default router;
