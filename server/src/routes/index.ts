import { Router } from 'express';
import imageRoutes from './images';
import collectionRoutes from './collections';
import taxonomyRoutes from './taxonomy';
import authRoutes from './auth';

const router = Router();

router.use('/images', imageRoutes);
router.use('/collections', collectionRoutes);
router.use('/auth', authRoutes);
router.use('/', taxonomyRoutes);

export default router;
