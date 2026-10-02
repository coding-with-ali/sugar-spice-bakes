import type { Product } from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('ssb_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      (data as { error?: string } | null)?.error ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

/** Resolve a product image path to a usable URL. */
export function imgSrc(p?: string | null): string {
  if (!p) return '/images/hero-bakery.jpg';
  if (p.startsWith('http') || p.startsWith('/images/')) return p;
  if (p.startsWith('/uploads/')) return `${API_URL}${p}`;
  if (p.startsWith('uploads/')) return `${API_URL}/${p}`;
  return p;
}

/** Normalize a product record (handles Mongoose `_id` if present). */
export function normProduct(p: Record<string, unknown>): Product {
  const id = (p.id ?? p._id ?? '') as number | string;
  const sizes = Array.isArray(p.sizes) ? (p.sizes as ProductSizeInput[]) : [];
  return {
    id,
    name: String(p.name ?? ''),
    slug: String(p.slug ?? ''),
    category: String(p.category ?? ''),
    description: String(p.description ?? ''),
    images: (p.images as string[]) || [],
    sizes: sizes.map((s) => ({
      label: String(s?.label ?? ''),
      price: Number(s?.price ?? 0),
    })),
    basePrice: Number(p.basePrice ?? p.base_price ?? 0),
    oldPrice: p.oldPrice == null && p.old_price == null ? null : Number(p.oldPrice ?? p.old_price ?? 0),
    rating: Number(p.rating ?? 0),
    reviewsCount: Number(p.reviewsCount ?? p.reviews_count ?? 0),
    badges: (p.badges as string[]) || [],
    inStock: !!((p.inStock ?? p.in_stock ?? true) as boolean),
    stock: Number(p.stock ?? 0),
    featured: !!p.featured,
    bestseller: !!p.bestseller,
    created_at: p.created_at ? String(p.created_at) : undefined,
  };
}

interface ProductSizeInput {
  label?: unknown;
  price?: unknown;
}

export function normProducts(list: unknown): Product[] {
  if (!Array.isArray(list)) return [];
  return list.map((p) => normProduct(p as Record<string, unknown>));
}

/** PKR 2,200 */
export function formatPKR(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return `PKR ${v.toLocaleString('en-PK')}`;
}

export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FLAT = 250;

export function shippingFor(subtotalAfterDiscount: number): number {
  return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export const CATEGORIES = [
  'Cakes',
  'Cupcakes',
  'Brownies & Bars',
  'Cheesecakes',
  'Pastries',
  'Custom Cakes',
];

/** Price of a product at a given size label (falls back to basePrice). */
export function priceForSize(p: Product, sizeLabel: string): number {
  const s = p.sizes.find((x) => x.label === sizeLabel);
  return s ? s.price : p.basePrice;
}

/** Earliest selectable delivery date for cakes: tomorrow (ISO yyyy-mm-dd). */
export function minDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
