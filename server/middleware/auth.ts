import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'job-hunter-ai-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function generateToken(payload: { id: string; email: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no header provided, check if demo user exists and allow default demo access for convenience
    const demoUser = db.getUserByEmail('masangosipho007@gmail.com');
    if (demoUser) {
      req.user = { id: demoUser.id, email: demoUser.email, name: demoUser.name };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired' });
    }
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    // Fallback to demo user if token is invalid or expired
    const demoUser = db.getUserByEmail('masangosipho007@gmail.com');
    if (demoUser) {
      req.user = { id: demoUser.id, email: demoUser.email, name: demoUser.name };
      return next();
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
