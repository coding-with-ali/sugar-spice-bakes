import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { requireAuth, signToken } from '../middleware/auth';
import { isValidEmail } from '../utils';

const router = Router();

function userPayload(u: any) {
  return { id: u._id, name: u.name, email: u.email, is_admin: !!u.isAdmin };
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (!isValidEmail(String(email))) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: phone ? String(phone).trim() : '',
      passwordHash,
    });
    const token = signToken(String(user._id), user.isAdmin);
    return res.json({ ok: true, user: userPayload(user), token });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(String(user._id), user.isAdmin);
    return res.json({ ok: true, user: userPayload(user), token });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/admin/login — only users flagged as admin may use this
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'This account does not have admin access' });
    }
    const token = signToken(String(user._id), true);
    return res.json({ ok: true, user: userPayload(user), token });
  } catch (err) {
    return res.status(500).json({ error: 'Admin login failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.json({ user: null });
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        is_admin: !!user.isAdmin,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

export default router;
