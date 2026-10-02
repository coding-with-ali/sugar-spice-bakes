import { Router, Request, Response } from 'express';
import { Newsletter } from '../models/Newsletter';
import { isValidEmail } from '../utils';

const router = Router();

// POST /api/newsletter
router.post('/newsletter', async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email || !isValidEmail(String(email))) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    const normalized = String(email).trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: normalized });
    if (existing) {
      return res.json({ ok: true, message: "You're already on our list — thank you!" });
    }
    await Newsletter.create({ email: normalized });
    return res.json({ ok: true, message: 'Thanks for subscribing! Fresh bakes and sweet offers are on the way.' });
  } catch (err) {
    return res.status(500).json({ error: 'Subscription failed' });
  }
});

export default router;
