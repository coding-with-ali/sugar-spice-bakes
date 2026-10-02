import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { CustomInquiry } from '../models/CustomInquiry';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireAdmin);

function dayStart(offsetDays: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

// GET /api/admin/stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const nonCancelled = { status: { $ne: 'cancelled' } };

    const [revenueAgg, orders, products, customers, lowStock, recent, byDayRaw, byStatusRaw, inquiryCount, recentInquiries] =
      await Promise.all([
        Order.aggregate([{ $match: nonCancelled }, { $group: { _id: null, v: { $sum: '$total' } } }]),
        Order.countDocuments(),
        Product.countDocuments(),
        User.countDocuments({ isAdmin: { $ne: true } }),
        Product.find({ stock: { $lte: 10 } })
          .sort({ stock: 1 })
          .limit(10)
          .lean(),
        Order.find().sort({ createdAt: -1 }).limit(8).lean(),
        Order.aggregate([
          { $match: { ...nonCancelled, createdAt: { $gte: dayStart(-13) } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              v: { $sum: '$total' },
              c: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Order.aggregate([{ $group: { _id: '$status', c: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
        CustomInquiry.countDocuments({ status: 'new' }),
        CustomInquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    const byDay: Array<{ d: string; v: number; c: number }> = [];
    const byDayMap = new Map(byDayRaw.map((b: any) => [b._id, { v: b.v, c: b.c }]));
    for (let i = 13; i >= 0; i--) {
      const d = dayStart(-i).toISOString().slice(0, 10);
      const entry = byDayMap.get(d) || { v: 0, c: 0 };
      byDay.push({ d, v: entry.v, c: entry.c });
    }

    return res.json({
      revenue: revenueAgg[0]?.v || 0,
      orders,
      products,
      customers,
      lowStock: lowStock.map((p: any) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        image: (p.images && p.images[0]) || '',
      })),
      recent: recent.map((o: any) => ({
        order_number: o.orderNumber,
        name: o.customer?.name,
        total: o.total,
        status: o.status,
        created_at: o.createdAt,
      })),
      byDay,
      byStatus: byStatusRaw.map((b: any) => ({ status: b._id, c: b.c })),
      inquiryCount,
      recentInquiries: recentInquiries.map((i: any) => ({
        id: i._id,
        occasion: i.occasion,
        name: i.name,
        phone: i.phone,
        status: i.status,
        delivery_date: i.deliveryDate,
        created_at: i.createdAt,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
