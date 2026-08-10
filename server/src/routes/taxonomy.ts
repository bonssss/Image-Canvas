import { Router } from 'express';
import { taxonomyController } from '../controllers/taxonomyController';

const router = Router();

router.get('/categories', (req, res, next) => taxonomyController.getCategories(req, res, next));
router.get('/styles', (req, res, next) => taxonomyController.getStyles(req, res, next));
router.get('/stats', (req, res, next) => taxonomyController.getStats(req, res, next));

export default router;
