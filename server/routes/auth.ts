import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = db.createUser(email, passwordHash, name);
    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    return res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const demoEmail = 'masangosipho007@gmail.com';
    let user = db.getUserByEmail(demoEmail);
    if (!user) {
      db.resetToDemo();
      user = db.getUserByEmail(demoEmail);
    }

    if (!user) {
      return res.status(500).json({ error: 'Demo user not available' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    return res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error setting up demo session' });
  }
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ user: req.user });
});

router.post('/logout', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
