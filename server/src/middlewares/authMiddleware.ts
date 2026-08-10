import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'u-101'; // Default fallback demo user (Alex Vance / NovaArtisan)

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Check if custom header specified user id or demo token
      if (token && token.startsWith('u-')) {
        userId = token;
      }
    }

    const userHeader = req.headers['x-user-id'] as string;
    if (userHeader) {
      userId = userHeader;
    }

    const user = await db.getUser(userId);
    if (user) {
      req.user = user;
    } else {
      req.user = {
        id: userId,
        email: 'user@artisan.ai',
        username: 'Creator',
        fullName: 'Creative Explorer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    next();
  } catch (err) {
    next(err);
  }
};
