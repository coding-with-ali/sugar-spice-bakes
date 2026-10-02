import { Router, Request, Response } from 'express';
import { CustomInquiry, INQUIRY_STATUSES, InquiryStatus } from '../models/CustomInquiry';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { isValidEmail, isValidPkPhone } from '../utils';

const router = Router();

const NAME_RE = /^[A-Za-z][A-Za-z\s.'-]*$/;

function tomorrowStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function serializeInquiry(i: any) {
  const obj = i.toObject ? i.toObject() : i;
  return {
    id: obj._id,
    occasion: obj.occasion,
    servings: obj.servings,
    size: obj.size ?? '',
    flavor: obj.flavor,
    design: obj.design,
    delivery_date: obj.deliveryDate,
    deliveryDate: obj.deliveryDate,
    name: obj.name,
    phone: obj.phone,
    city: obj.city,
    email: obj.email ?? '',
    status: obj.status,
    notes: obj.notes ?? '',
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
  };
}

// POST /api/custom-inquiries (public) — strict Daraz-style validation
router.post('/custom-inquiries', async (req: Request, res: Response) => {
  try {
    const {
      occasion,
      servings,
      size,
      flavor,
      design,
      deliveryDate,
      name,
      phone,
      city,
      email,
    } = req.body || {};

    const cleanOccasion = String(occasion || '').trim();
    const cleanServings = String(servings || '').trim();
    const cleanSize = String(size || '').trim();
    const cleanFlavor = String(flavor || '').trim();
    const cleanDesign = String(design || '').trim();
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanCity = String(city || '').trim();
    const cleanEmail = String(email || '').trim();

    if (!cleanOccasion) {
      return res.status(400).json({ error: 'Please select an occasion' });
    }
    if (!cleanServings) {
      return res.status(400).json({ error: 'Please select how many servings you need' });
    }
    if (!cleanFlavor) {
      return res.status(400).json({ error: 'Please choose a flavor' });
    }
    if (cleanDesign.length < 10) {
      return res.status(400).json({ error: 'Please describe your design (min 10 characters)' });
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
    if (cleanName.length < 3) {
      return res.status(400).json({ error: 'Please enter your full name (min 3 characters)' });
    }
    if (!NAME_RE.test(cleanName)) {
      return res
        .status(400)
        .json({ error: 'Name may only contain letters, spaces, hyphens and apostrophes' });
    }
    if (!isValidPkPhone(cleanPhone)) {
      return res
        .status(400)
        .json({ error: 'Please enter a valid 11-digit mobile number starting with 03' });
    }
    if (!cleanCity) {
      return res.status(400).json({ error: 'Please enter your city' });
    }
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const inquiry = await CustomInquiry.create({
      occasion: cleanOccasion,
      servings: cleanServings,
      size: cleanSize,
      flavor: cleanFlavor,
      design: cleanDesign,
      deliveryDate: delivery,
      name: cleanName,
      phone: cleanPhone,
      city: cleanCity,
      email: cleanEmail ? cleanEmail.toLowerCase() : undefined,
      status: 'new',
    });

    return res.status(201).json({
      ok: true,
      id: inquiry._id,
      occasion: inquiry.occasion,
      deliveryDate: inquiry.deliveryDate,
      name: inquiry.name,
      status: inquiry.status,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// ---------- ADMIN ----------
router.use('/admin/inquiries', requireAuth, requireAdmin);

// GET /api/admin/inquiries?status= (newest first)
router.get('/admin/inquiries', async (req: Request, res: Response) => {
  try {
    const { status } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};
    if (status) {
      if (!(INQUIRY_STATUSES as string[]).includes(status)) {
        return res
          .status(400)
          .json({ error: `Invalid status. Must be one of: ${INQUIRY_STATUSES.join(', ')}` });
      }
      filter.status = status;
    }
    const inquiries = await CustomInquiry.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json(inquiries.map(serializeInquiry));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load inquiries' });
  }
});

// PATCH /api/admin/inquiries/:id {status, notes}
router.patch('/admin/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body || {};
    const inquiry = await CustomInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (status !== undefined) {
      if (!(INQUIRY_STATUSES as string[]).includes(status)) {
        return res
          .status(400)
          .json({ error: `Invalid status. Must be one of: ${INQUIRY_STATUSES.join(', ')}` });
      }
      inquiry.status = status as InquiryStatus;
    }
    if (notes !== undefined) inquiry.notes = String(notes);
    await inquiry.save();
    return res.json({ ok: true, inquiry: serializeInquiry(inquiry) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

export default router;
