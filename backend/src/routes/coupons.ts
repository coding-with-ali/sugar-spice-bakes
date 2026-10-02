import { Router, Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { calculateDiscount } from '../utils';

const router = Router();

// Validate a coupon code against a subtotal. Throws { status, error } on failure.
export async function validateCouponForSubtotal(code: string, subtotal: number) {
  const normalized = String(code).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalized });
  if (!coupon) throw { status: 400, error: 'Invalid coupon code' };
  if (!coupon.active) throw { status: 400, error: 'This coupon is no longer active' };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    throw { status: 400, error: 'This coupon has reached its usage limit' };
  if (subtotal < coupon.minOrder)
    throw {
      status: 400,
      error: `This coupon requires a minimum order of PKR ${coupon.minOrder}`,
    };
  const discount = calculateDiscount(coupon.type, coupon.value, subtotal);
  return { coupon, discount };
}

// POST /api/coupons/validate
router.post('/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    const { coupon, discount } = await validateCouponForSubtotal(
      String(code),
      Number(subtotal) || 0
    );
    return res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    });
  } catch (err: any) {
    if (err && err.status) return res.status(err.status).json({ error: err.error });
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// ---------- ADMIN /api/admin/coupons ----------
router.use('/admin/coupons', requireAuth, requireAdmin);

function serializeCoupon(c: any) {
  return {
    id: c._id,
    code: c.code,
    type: c.type,
    value: c.value,
    min_order: c.minOrder,
    active: c.active,
    usage_limit: c.usageLimit,
    used_count: c.usedCount,
    created_at: c.createdAt,
  };
}

router.get('/admin/coupons', async (_req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.json(coupons.map(serializeCoupon));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load coupons' });
  }
});

router.post('/admin/coupons', async (req: Request, res: Response) => {
  try {
    const { code, type, value, min_order, usage_limit } = req.body || {};
    if (!code || !type || value === undefined || value === '') {
      return res.status(400).json({ error: 'Code, type and value are required' });
    }
    if (type !== 'percent' && type !== 'fixed') {
      return res.status(400).json({ error: "Type must be 'percent' or 'fixed'" });
    }
    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      type,
      value: Number(value),
      minOrder: min_order !== undefined && min_order !== '' ? Number(min_order) : 0,
      usageLimit: usage_limit !== undefined && usage_limit !== '' ? Number(usage_limit) : 0,
    });
    return res.json({ ok: true, id: coupon._id });
  } catch (err: any) {
    if (err?.code === 11000)
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    return res.status(500).json({ error: 'Failed to create coupon' });
  }
});

router.put('/admin/coupons/:id', async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    const { active, value, min_order, usage_limit } = req.body || {};
    if (active !== undefined) coupon.active = !!active;
    if (value !== undefined && value !== '') coupon.value = Number(value);
    if (min_order !== undefined && min_order !== '') coupon.minOrder = Number(min_order);
    if (usage_limit !== undefined && usage_limit !== '') coupon.usageLimit = Number(usage_limit);
    await coupon.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update coupon' });
  }
});

router.delete('/admin/coupons/:id', async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

export default router;
