export interface ProductSize {
  label: string;
  price: number;
}

export interface Product {
  id: number | string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  images: string[];
  sizes: ProductSize[];
  basePrice: number;
  oldPrice?: number | null;
  rating: number;
  reviewsCount: number;
  badges: string[];
  inStock: boolean;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  created_at?: string;
}

export interface CartItem {
  id: number | string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  cakeMessage?: string;
  qty: number;
}

export interface OrderTimelineEntry {
  status: string;
  at: string;
  note?: string;
}

export interface OrderItem {
  name: string;
  size?: string;
  cakeMessage?: string;
  price: number;
  qty: number;
  image?: string;
}

export interface Order {
  id: number | string;
  order_number: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal?: string;
  payment_method: string;
  delivery_date?: string;
  subtotal: number;
  discount: number;
  coupon_code?: string;
  shipping: number;
  total: number;
  status: string;
  timeline: OrderTimelineEntry[];
  items?: OrderItem[];
  created_at?: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
}

export interface Coupon {
  id: number | string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  active: boolean;
  usage_limit: number;
  used_count?: number;
}

export interface AdminStats {
  revenue: number;
  orders: number;
  products: number;
  customers: number;
  lowStock: { id: number | string; name: string; stock: number; image: string }[];
  recent: { order_number: string; name: string; total: number; status: string; created_at?: string }[];
  byDay: { d: string; v: number; c: number }[];
  byStatus: { status: string; c: number }[];
}
