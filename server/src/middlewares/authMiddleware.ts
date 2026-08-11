import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null') {
        userId = token;
      }
    }

    const userHeader = req.headers['x-user-id'] as string;
    if (userHeader && userHeader !== 'undefined' && userHeader !== 'null') {
      userId = userHeader;
    }

    if (userId) {
      // Find the user dynamically
      let user = await db.getUserByEmail(userId);
      if (!user) user = await db.getUserByUsername(userId);
      if (!user) user = await db.getUser(userId);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required to perform this action' });
    return;
  }
  next();
};
