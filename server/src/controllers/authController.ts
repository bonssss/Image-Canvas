import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db } from '../db';
import { uploadToCloudinary } from '../config/cloudinary';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      const { email, username, fullName, avatarUrl, bio, password } = req.body;

      if (!email || !username || !fullName || !password) {
        res.status(400).json({ success: false, error: 'Email, username, full name, and password are required' });
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

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser: User = {
        id: `u-${uuidv4()}`,
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
        fullName: fullName.trim(),
        avatarUrl:
          avatarUrl?.trim() ||
          `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(username)}`,
        bio: bio?.trim() || 'Digital visual artist & AI prompt explorer',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedUser = await db.upsertUser(newUser);
      
      const token = jwt.sign({ id: savedUser.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

      // Omit password hash in response
      const { passwordHash: _, ...userWithoutPassword } = savedUser;

      res.status(201).json({
        success: true,
        data: { user: userWithoutPassword, token },
        message: 'Account created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        res.status(400).json({ success: false, error: 'Email/username and password are required' });
        return;
      }

      const input = emailOrUsername.trim().toLowerCase();
      let user = await db.getUserByEmail(input);
      if (!user) {
        user = await db.getUserByUsername(input);
      }

      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }
      
      const isMatch = await bcrypt.compare(password, user.passwordHash || '');
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
      
      const { passwordHash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword, token },
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

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const resetToken = uuidv4();
      const resetTokenHash = await bcrypt.hash(resetToken, 10);
      
      const expireTime = new Date();
      expireTime.setHours(expireTime.getHours() + 1); // 1 hour expiration

      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpiresAt = expireTime.toISOString();
      await db.upsertUser(user);

      console.log(`\n\n[FORGOT PASSWORD TEST]: Token for ${user.email} is: ${resetToken}\n\n`);

      res.json({
        success: true,
        message: 'Password reset link generated.',
        data: { testToken: resetToken } // ONLY FOR TESTING LOCALLY
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !token || !newPassword) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      const user = await db.getUserByEmail(email);
      if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
        res.status(400).json({ success: false, error: 'Invalid or expired token' });
        return;
      }

      if (new Date(user.resetPasswordExpiresAt) < new Date()) {
        res.status(400).json({ success: false, error: 'Token has expired' });
        return;
      }

      const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
      if (!isMatch) {
        res.status(400).json({ success: false, error: 'Invalid token' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;

      await db.upsertUser(user);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id || req.headers['x-user-id'] as string;
      const { currentPassword, newPassword } = req.body;

      if (!userId || !currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      const user = await db.getUser(userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || '');
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Incorrect current password' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);

      await db.upsertUser(user);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
