import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Product } from '../models/Product';
import { Order, ORDER_STATUSES, OrderStatus } from '../models/Order';
import { config } from '../config';
import {
  generateOrderNumber,
  calculateShipping,
  isValidEmail,
  isValidPkPhone,
  serializeOrder,
} from '../utils';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateCouponForSubtotal } from './coupons';

const router = Router();

function getOptionalUserId(req: Request): string | undefined {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { id: string };
    return payload.id;
  } catch {
    return undefined;
  }
}

interface IncomingItem {
  id: string;
  size?: string;
  qty: number;
  cakeMessage?: string;
}

async function buildTotals(items: IncomingItem[], couponCode?: string) {
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, error: 'Order must include at least one item' };
  }
  let subtotal = 0;
  const lines: Array<{
    productId: any;
    name: string;
    size?: string;
    cakeMessage?: string;
    price: number;
    qty: number;
    image?: string;
  }> = [];
  for (const item of items) {
    const qty = Number(item.qty);
    if (!item.id || !Number.isInteger(qty) || qty < 1) {
      throw { status: 400, error: 'Each item needs a valid product id and quantity' };
    }
    const product = await Product.findById(item.id);
    if (!product) throw { status: 400, error: 'One of the products is no longer available' };
    if (!product.inStock) throw { status: 400, error: `"${product.name}" is currently out of stock` };
    if (product.stock < qty) {
      throw { status: 400, error: `Not enough stock for "${product.name}"` };
    }

    // Size-price lookup against the DB record
    let price: number;
    let sizeLabel = '';
    if (product.sizes.length > 0) {
      const wanted = String(item.size || '').trim();
      const match = product.sizes.find((s) => s.label === wanted);
      if (!match) {
        throw {
          status: 400,
          error: `Invalid size "${wanted || '—'}" for "${product.name}". Available: ${product.sizes
            .map((s) => s.label)
            .join(', ')}`,
        };
      }
      price = match.price;
      sizeLabel = match.label;
    } else {
      price = product.basePrice;
    }

    const cakeMessage = String(item.cakeMessage || '').trim();
    if (cakeMessage.length > 120) {
      throw { status: 400, error: 'Cake message must be 120 characters or fewer' };
    }

    subtotal += price * qty;
    lines.push({
      productId: product._id,
      name: product.name,
      size: sizeLabel || undefined,
      cakeMessage: cakeMessage || undefined,
      price,
      qty,
      image: product.images[0] || '',
    });
  }

  // Coupon: validate silently — apply only if valid
  let discount = 0;
  let coupon: any = null;
  if (couponCode) {
    try {
      const result = await validateCouponForSubtotal(String(couponCode), subtotal);
      coupon = result.coupon;
      discount = result.discount;
    } catch {
      discount = 0;
      coupon = null;
    }
  }
  const shipping = calculateShipping(subtotal, discount);
  const total = subtotal - discount + shipping;
  return { lines, subtotal, discount, coupon, shipping, total };
}

export { buildTotals };

function tomorrowStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]*$/;

// POST /api/orders — guest checkout with strict server-side validation
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      email,
      postal,
      items,
      coupon,
      paymentMethod,
      payment_method,
      deliveryDate,
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }

    // --- Strict customer validation (no account needed) ---
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanAddress = String(address || '').trim();
    const cleanCity = String(city || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanPostal = String(postal || '').trim();

    if (cleanName.length < 3) {
      return res.status(400).json({ error: 'Please enter your full name (min 3 characters)' });
    }
    if (!NAME_RE.test(cleanName)) {
      return res.status(400).json({ error: 'Name may only contain letters, spaces, hyphens and apostrophes' });
    }
    if (!isValidPkPhone(cleanPhone)) {
      return res
        .status(400)
        .json({ error: 'Please enter a valid 11-digit mobile number starting with 03' });
    }
    if (cleanAddress.length < 10) {
      return res.status(400).json({ error: 'Please enter your complete street address' });
    }
    if (!cleanCity) {
      return res.status(400).json({ error: 'Please select your city' });
    }
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (cleanPostal && !/^\d{5}$/.test(cleanPostal)) {
      return res.status(400).json({ error: 'Postal code must be 5 digits' });
    }
    const payMethod = paymentMethod || payment_method;
    if (payMethod !== 'cod' && payMethod !== 'bank') {
      return res.status(400).json({ error: "paymentMethod must be 'cod' or 'bank'" });
    }
    if (!deliveryDate) {
      return res.status(400).json({ error: 'Please choose a delivery date' });
    }
    const delivery = new Date(deliveryDate);
    if (isNaN(delivery.getTime())) {
      return res.status(400).json({ error: 'Invalid delivery date' });
    }
    if (delivery < tomorrowStart()) {
      return res
        .status(400)
        .json({ error: 'Delivery date must be at least one day from today' });
    }

    const { lines, subtotal, discount, coupon: appliedCoupon, shipping, total } =
      await buildTotals(items, coupon);

    // Decrement stock
    for (const line of lines) {
      await Product.updateOne(
        { _id: line.productId, stock: { $gte: line.qty } },
        { $inc: { stock: -line.qty } }
      );
    }
    // Increment coupon usage
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      user: getOptionalUserId(req),
      customer: {
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        city: cleanCity,
        email: cleanEmail ? cleanEmail.toLowerCase() : undefined,
      },
      items: lines,
      paymentMethod: payMethod,
      deliveryDate: delivery,
      postal: cleanPostal || undefined,
      subtotal,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      shipping,
      total,
      status: 'pending',
      timeline: [{ status: 'pending', at: new Date(), note: 'Order received' }],
    });

    return res.json({
      ok: true,
      order_number: orderNumber,
      order_id: order._id,
      total,
    });
  } catch (err: any) {
    if (err && err.status) return res.status(err.status).json({ error: err.error });
    return res.status(500).json({ error: 'Checkout failed' });
  }
});

// GET /api/orders/track/:orderNumber?phone= — 403 unless the full phone matches
router.get('/orders/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const cleanPhone = String(req.query.phone || '').replace(/\D/g, '');
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order || !cleanPhone || order.customer.phone !== cleanPhone) {
      return res.status(403).json({ error: 'Invalid order number or phone number' });
    }
    return res.json(serializeOrder(order));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to track order' });
  }
});

// GET /api/orders/mine (auth) — newest first, includes timeline
router.get('/orders/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
    return res.json(orders.map(serializeOrder));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

// ---------- ADMIN ----------
router.use('/admin/orders', requireAuth, requireAdmin);

// GET /api/admin/orders?status=
router.get('/admin/orders', async (req: Request, res: Response) => {
  try {
    const { status, q } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};
    if (status) {
      if (!(ORDER_STATUSES as string[]).includes(status)) {
        return res
          .status(400)
          .json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` });
      }
      filter.status = status;
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { orderNumber: rx },
        { 'customer.name': rx },
        { 'customer.email': rx },
        { 'customer.phone': rx },
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json(orders.map(serializeOrder));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

// Allowed status transitions: pending → baking → out_for_delivery → delivered, or cancelled
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['baking', 'cancelled'],
  baking: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// PATCH /api/admin/orders/:id
router.patch('/admin/orders/:id', async (req: Request, res: Response) => {
  try {
    const { status } = req.body || {};
    if (!status || !(ORDER_STATUSES as string[]).includes(status)) {
      return res
        .status(400)
        .json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const allowed = TRANSITIONS[order.status];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ error: `Cannot move order from "${order.status}" to "${status}"` });
    }

    order.status = status as OrderStatus;
    order.timeline.push({ status, at: new Date(), note: 'Status updated by admin' });
    await order.save();
    return res.json({ ok: true, order: serializeOrder(order) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// GET /api/admin/orders/:id
router.get('/admin/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(serializeOrder(order));
  } catch (err) {
    return res.status(404).json({ error: 'Order not found' });
  }
});

export default router;
