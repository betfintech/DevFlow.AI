import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService.ts';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwtService.verifyToken(token);
    
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};