import { Router } from 'express';
import { collectionController } from '../controllers/collectionController';
import { authenticate } from '../middlewares/authMiddleware';
import { validate, createCollectionSchema, updateCollectionSchema } from '../middlewares/validation';

const router = Router();

// List collections
router.get('/', authenticate, (req, res, next) => collectionController.getCollections(req, res, next));

// Get collection by ID with image collage/gallery
router.get('/:id', authenticate, (req, res, next) => collectionController.getCollectionById(req, res, next));

// Create collection
router.post(
  '/',
  authenticate,
  validate(createCollectionSchema),
  (req, res, next) => collectionController.createCollection(req, res, next)
);

// Update / Rename collection
router.patch(
  '/:id',
  authenticate,
  validate(updateCollectionSchema),
  (req, res, next) => collectionController.updateCollection(req, res, next)
);

// Delete collection
router.delete('/:id', authenticate, (req, res, next) => collectionController.deleteCollection(req, res, next));

// Add image to collection
router.post('/:id/images', authenticate, (req, res, next) => collectionController.addImage(req, res, next));

// Remove image from collection
router.delete('/:id/images/:imageId', authenticate, (req, res, next) => collectionController.removeImage(req, res, next));

// Check which collections contain a given image
router.get('/saved-status/:imageId', authenticate, (req, res, next) => collectionController.getSavedCollectionsForImage(req, res, next));

export default router;
