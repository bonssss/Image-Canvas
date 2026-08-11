import { Router } from 'express';
import { imageController } from '../controllers/imageController';
import { authenticate, requireAuth } from '../middlewares/authMiddleware';
import { generationRateLimiter } from '../middlewares/rateLimiter';
import { validate, generateImageSchema } from '../middlewares/validation';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Browse & Discover with cursor pagination & filters
router.get('/', authenticate, (req, res, next) => imageController.getImages(req, res, next));

// Liked images for current user (requires auth)
router.get('/liked', authenticate, requireAuth, (req, res, next) => imageController.getLikedImages(req, res, next));

// User uploads an image
router.post('/upload', authenticate, requireAuth, upload.single('image'), (req, res, next) => imageController.uploadImage(req, res, next));

// Image details
router.get('/:id', authenticate, (req, res, next) => imageController.getImageById(req, res, next));

// Related images
router.get('/:id/related', authenticate, (req, res, next) => imageController.getRelatedImages(req, res, next));

// Like / Unlike (requires auth)
router.post('/:id/like', authenticate, requireAuth, (req, res, next) => imageController.toggleLike(req, res, next));

// Track download (requires auth)
router.post('/:id/download', authenticate, requireAuth, (req, res, next) => imageController.trackDownload(req, res, next));

// AI Image Generation (requires auth)
router.post(
  '/generate',
  authenticate,
  requireAuth,
  generationRateLimiter,
  validate(generateImageSchema),
  (req, res, next) => imageController.generateImage(req, res, next)
);

export default router;
