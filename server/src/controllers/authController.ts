import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db } from '../db';
import { uploadToCloudinary } from '../config/cloudinary';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, fullName, avatarUrl, bio } = req.body;

      if (!email || !username || !fullName) {
        res.status(400).json({ success: false, error: 'Email, username, and full name are required' });
        return;
      }

      // Check if email already exists
      const existingEmail = await db.getUserByEmail(email);
      if (existingEmail) {
        res.status(409).json({ success: false, error: 'An account with this email already exists' });
        return;
      }

      // Check if username already exists
      const existingUsername = await db.getUserByUsername(username);
      if (existingUsername) {
        res.status(409).json({ success: false, error: 'Username is already taken' });
        return;
      }

      const newUser: User = {
        id: `u-${uuidv4()}`,
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
        fullName: fullName.trim(),
        avatarUrl:
          avatarUrl?.trim() ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(username)}`,
        bio: bio?.trim() || 'Digital visual artist & AI prompt explorer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedUser = await db.upsertUser(newUser);

      res.status(201).json({
        success: true,
        data: savedUser,
        message: 'Account created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailOrUsername } = req.body;

      if (!emailOrUsername) {
        res.status(400).json({ success: false, error: 'Email or username is required' });
        return;
      }

      const input = emailOrUsername.trim().toLowerCase();
      let user = await db.getUserByEmail(input);
      if (!user) {
        user = await db.getUserByUsername(input);
      }

      if (!user) {
        res.status(404).json({ success: false, error: 'User account not found' });
        return;
      }

      res.json({
        success: true,
        data: user,
        message: 'Signed in successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async syncProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, email, username, fullName, avatarUrl, bio } = req.body;
      const targetId = id || req.user?.id || 'u-101';
      const existing = await db.getUser(targetId);

      const updatedUser: User = {
        id: targetId,
        email: email || existing?.email || 'creator@artisan.ai',
        username: username || existing?.username || 'Creator',
        fullName: fullName || existing?.fullName || 'Artisan AI',
        avatarUrl:
          avatarUrl ||
          existing?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: bio !== undefined ? bio : existing?.bio,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await db.upsertUser(updatedUser);
      res.json({ success: true, data: saved });
    } catch (err) {
      next(err);
    }
  }

  async getDemoUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const allUsers = await db.getAllUsers();
      res.json({
        success: true,
        data: allUsers,
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = String(req.params.identifier);
      const profileData = await db.getUserProfileData(identifier);

      if (!profileData) {
        res.status(404).json({ success: false, error: 'Creator profile not found' });
        return;
      }

      res.json({
        success: true,
        data: profileData,
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadProfilePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No image file provided' });
        return;
      }
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const imageUrl = await uploadToCloudinary(req.file.buffer, 'promptcanvas/avatars');
      
      // Update user in database
      const user = await db.getUser(userId);
      if (user) {
        user.avatarUrl = imageUrl;
        await db.upsertUser(user);
      }

      res.json({ success: true, data: { avatarUrl: imageUrl } });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
