import { IProduct } from './models/Product';
import { IOrder } from './models/Order';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ORDER_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateOrderNumber(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += ORDER_CHARS[Math.floor(Math.random() * ORDER_CHARS.length)];
  }
  return `SSB-${suffix}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Pakistani mobile number: 11 digits starting with 03. */
export function isValidPkPhone(phone: string): boolean {
  return /^03\d{9}$/.test(phone.replace(/\D/g, ''));
}

export function serializeProduct(p: IProduct | any) {
  const obj = p.toObject ? p.toObject() : p;
  const images: string[] = obj.images ?? [];
  return {
    id: obj._id,
    name: obj.name,
    slug: obj.slug,
    category: obj.category,
    base_price: obj.basePrice,
    old_price: obj.oldPrice ?? null,
    description: obj.description ?? '',
    images,
    image: images[0] ?? '',
    sizes: (obj.sizes ?? []).map((s: any) => ({ label: s.label, price: s.price })),
    stock: obj.stock,
    in_stock: !!obj.inStock,
    badges: obj.badges ?? [],
    rating: obj.rating ?? 0,
    reviews_count: obj.reviewsCount ?? 0,
    featured: !!obj.featured,
    bestseller: !!obj.bestseller,
    created_at: obj.createdAt,
  };
}

export function serializeOrder(o: IOrder | any) {
  const obj = o.toObject ? o.toObject() : o;
  const c = obj.customer || {};
  return {
    id: obj._id,
    order_number: obj.orderNumber,
    user: obj.user,
    // flat customer fields (frontend-friendly) + nested customer (compat)
    name: c.name,
    phone: c.phone,
    address: c.address,
    city: c.city,
    email: c.email ?? '',
    postal: obj.postal ?? '',
    customer: {
      name: c.name,
      phone: c.phone,
      address: c.address,
      city: c.city,
      email: c.email ?? '',
    },
    items: (obj.items || []).map((it: any) => ({
      product_id: it.productId,
      name: it.name,
      size: it.size ?? '',
      cake_message: it.cakeMessage ?? '',
      cakeMessage: it.cakeMessage ?? '',
      price: it.price,
      qty: it.qty,
      image: it.image ?? '',
    })),
    payment_method: obj.paymentMethod,
    delivery_date: obj.deliveryDate,
    subtotal: obj.subtotal,
    discount: obj.discount,
    coupon_code: obj.couponCode ?? null,
    shipping: obj.shipping,
    total: obj.total,
    status: obj.status,
    timeline: (obj.timeline || []).map((t: any) => ({
      status: t.status,
      at: t.at,
      note: t.note ?? '',
    })),
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
  };
}

export function calculateDiscount(
  type: 'percent' | 'fixed',
  value: number,
  subtotal: number
): number {
  const raw = type === 'percent' ? Math.round((subtotal * value) / 100) : value;
  return Math.max(0, Math.min(raw, subtotal));
}

/** Free shipping when subtotal-after-discount >= 5000, otherwise flat 250. */
export function calculateShipping(subtotal: number, discount: number): number {
  return subtotal - discount >= 5000 ? 0 : 250;
}
