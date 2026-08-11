import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Public auth endpoints
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/profile/:identifier', (req, res, next) => authController.getUserProfile(req, res, next));
router.get('/users', (req, res, next) => authController.getDemoUsers(req, res, next));

// Authenticated session endpoints
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));
router.post('/sync', authenticate, (req, res, next) => authController.syncProfile(req, res, next));
router.post('/profile-photo', authenticate, upload.single('photo'), (req, res, next) => authController.uploadProfilePhoto(req, res, next));
router.get('/demo-users', authenticate, (req, res, next) => authController.getDemoUsers(req, res, next));

export default router;
