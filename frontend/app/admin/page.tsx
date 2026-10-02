'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { api, imgSrc, formatPKR, CATEGORIES } from '@/lib/api';
import { useToast } from '@/lib/store-context';
import { Reveal } from '@/components/motion';
import type { AdminStats, Coupon, Order, Product } from '@/lib/types';

/* ------------------------------ types ------------------------------ */

interface Inquiry {
  id: string;
  occasion: string;
  servings: string;
  flavor: string;
  design: string;
  deliveryDate?: string;
  name: string;
  phone: string;
  city: string;
  email?: string;
  status: string;
  notes?: string;
  created_at?: string;
}

const ORDER_STATUSES = ['pending', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];
const INQUIRY_STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'];

const KNOWN_IMAGES = [
  'chocolate-truffle.jpg',
  'red-velvet.jpg',
  'pineapple-cream.jpg',
  'black-forest.jpg',
  'vanilla-sprinkle.jpg',
  'cupcakes-box.jpg',
  'fudge-brownies.jpg',
  'ny-cheesecake.jpg',
  'macarons.jpg',
  'butter-croissants.jpg',
  'fondant-birthday.jpg',
  'tres-leches.jpg',
  'hero-bakery.jpg',
  'baker-craft.jpg',
];

/* ------------------------------ login ------------------------------ */

function AdminLogin({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await api<{ token: string }>('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      window.localStorage.setItem('ssb_token', data.token);
      toast('Welcome back, baker! 👩‍🍳', 'success');
      onDone();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Login failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <form onSubmit={submit} className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-cocoa/10">
        <p className="text-center text-5xl">👩‍🍳</p>
        <h1 className="mt-4 text-center font-display text-3xl font-black text-cocoa">Bakery HQ</h1>
        <p className="mt-2 text-center text-sm text-cocoa/60">Admin sign-in for Sugar & Spice Bakes</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          type="email"
          className="mt-8 w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-5 py-3.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="mt-3 w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-5 py-3.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-cocoa py-4 text-sm font-bold uppercase tracking-[0.2em] text-cream disabled:opacity-60"
        >
          {busy ? '…' : 'Enter the kitchen'}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------ shell ------------------------------ */

type Tab = 'overview' | 'orders' | 'products' | 'inquiries' | 'coupons';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const { toast } = useToast();

  const check = useCallback(async () => {
    try {
      const d = await api<{ user: { is_admin: boolean } | null }>('/api/auth/me');
      setAuthed(!!d.user?.is_admin);
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (authed === null) return <div className="py-28 text-center text-cocoa/60">Preheating…</div>;
  if (!authed) return <AdminLogin onDone={check} />;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'orders', label: 'Orders', emoji: '📦' },
    { id: 'products', label: 'Products', emoji: '🧁' },
    { id: 'inquiries', label: 'Custom Inquiries', emoji: '🎂' },
    { id: 'coupons', label: 'Coupons', emoji: '🎟️' },
  ];

  const logout = () => {
    window.localStorage.removeItem('ssb_token');
    setAuthed(false);
    toast('Signed out of Bakery HQ.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <Reveal className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">Sugar & Spice Bakes</p>
          <h1 className="mt-1 font-display text-4xl font-black text-cocoa">Bakery HQ 👩‍🍳</h1>
        </div>
        <button onClick={logout} className="rounded-full border-2 border-cocoa/15 px-6 py-2.5 text-sm font-bold text-cocoa hover:bg-cocoa hover:text-cream">
          Sign out
        </button>
      </Reveal>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              tab === t.id ? 'bg-cocoa text-cream shadow-lg' : 'bg-white text-cocoa/70 ring-1 ring-cocoa/15 hover:bg-pinkSoft'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'inquiries' && <InquiriesTab />}
        {tab === 'coupons' && <CouponsTab />}
      </div>
    </div>
  );
}

/* ------------------------------ overview ------------------------------ */

function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    api<AdminStats>('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  if (!stats) return <p className="py-16 text-center text-cocoa/60">Loading stats…</p>;

  const cards = [
    { label: 'Revenue', value: formatPKR(stats.revenue), emoji: '💰', bg: 'bg-raspberry' },
    { label: 'Orders', value: String(stats.orders), emoji: '📦', bg: 'bg-caramel' },
    { label: 'Products', value: String(stats.products), emoji: '🧁', bg: 'bg-cocoa' },
    { label: 'Customers', value: String(stats.customers), emoji: '💛', bg: 'bg-butter' },
  ];

  const maxDay = Math.max(1, ...stats.byDay.map((d) => d.v));

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-[1.75rem] p-6 text-white shadow-lg`}>
            <p className="text-3xl">{c.emoji}</p>
            <p className="mt-3 font-display text-3xl font-black">{c.value}</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-cocoa/10">
          <h3 className="font-display text-xl font-bold text-cocoa">Revenue — last 14 days</h3>
          <div className="mt-5 flex h-36 items-end gap-1.5">
            {stats.byDay.map((d) => (
              <div key={d.d} className="group relative flex-1">
                <div
                  className="rounded-t-lg bg-gradient-to-t from-raspberry to-caramel transition-all group-hover:opacity-80"
                  style={{ height: `${Math.max(4, (d.v / maxDay) * 130)}px` }}
                  title={`${d.d}: ${formatPKR(d.v)} (${d.c} orders)`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-cocoa/10">
          <h3 className="font-display text-xl font-bold text-cocoa">Orders by status</h3>
          <div className="mt-4 space-y-2.5">
            {stats.byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="w-32 text-xs font-bold uppercase tracking-wider text-cocoa/60">{s.status.replace(/_/g, ' ')}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-creamDark">
                  <div className="h-full rounded-full bg-raspberry" style={{ width: `${Math.min(100, (s.c / Math.max(1, stats.orders)) * 100)}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-bold text-cocoa">{s.c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-cocoa/10">
          <h3 className="font-display text-xl font-bold text-cocoa">Recent orders</h3>
          <ul className="mt-4 space-y-2">
            {stats.recent.map((o) => (
              <li key={o.order_number} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-2.5 text-sm">
                <span className="font-mono font-bold text-cocoa/70">{o.order_number}</span>
                <span className="text-cocoa/60">{o.name}</span>
                <span className="font-bold text-cocoa">{formatPKR(o.total)}</span>
              </li>
            ))}
            {stats.recent.length === 0 && <p className="text-sm text-cocoa/50">No orders yet.</p>}
          </ul>
        </div>
        <div className="rounded-[1.75rem] bg-white p-6 ring-1 ring-cocoa/10">
          <h3 className="font-display text-xl font-bold text-cocoa">Low stock alert</h3>
          <ul className="mt-4 space-y-2">
            {stats.lowStock.map((p) => (
              <li key={String(p.id)} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-2.5 text-sm">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                  <Image src={imgSrc(p.image)} alt="" fill className="object-cover" />
                </div>
                <span className="flex-1 font-semibold text-cocoa">{p.name}</span>
                <span className="rounded-full bg-raspberry/15 px-3 py-1 text-xs font-bold text-raspberry">{p.stock} left</span>
              </li>
            ))}
            {stats.lowStock.length === 0 && <p className="text-sm text-cocoa/50">All stocked up! 🎉</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ orders ------------------------------ */

function OrdersTab() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const q = filter ? `?status=${filter}` : '';
    const data = await api<Order[]>(`/api/admin/orders${q}`).catch(() => []);
    setOrders(data);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string | number, status: string) => {
    try {
      await api(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      toast(`Order moved to ${status.replace(/_/g, ' ')}.`, 'success');
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['', ...ORDER_STATUSES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              filter === s ? 'bg-raspberry text-white' : 'bg-white text-cocoa/60 ring-1 ring-cocoa/15'
            }`}
          >
            {s ? s.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {orders.map((o) => (
          <div key={String(o.id)} className="rounded-[1.5rem] bg-white p-5 ring-1 ring-cocoa/10">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setExpanded(expanded === String(o.id) ? null : String(o.id))} className="flex flex-1 items-center gap-4 text-left">
                <div>
                  <p className="font-mono text-xs font-bold tracking-widest text-cocoa/50">{o.order_number}</p>
                  <p className="font-bold text-cocoa">{o.name} · {o.city}</p>
                  <p className="text-xs text-cocoa/55">
                    {(o.items || []).map((i) => `${i.name} (${i.size}) ×${i.qty}`).join(' · ')}
                  </p>
                </div>
              </button>
              <p className="font-display text-xl font-black text-cocoa">{formatPKR(o.total)}</p>
              <select
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className="rounded-full border-2 border-cocoa/12 bg-cream px-4 py-2 text-xs font-bold uppercase tracking-wider text-cocoa focus:border-raspberry focus:outline-none"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            {expanded === String(o.id) && (
              <div className="mt-4 grid gap-4 border-t border-cocoa/10 pt-4 text-sm md:grid-cols-2">
                <div>
                  <p className="font-bold text-cocoa">Customer</p>
                  <p className="text-cocoa/70">{o.phone} · {o.email || 'no email'}</p>
                  <p className="text-cocoa/70">{o.address}, {o.city} {o.postal || ''}</p>
                  <p className="mt-1 text-cocoa/70">💵 {o.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                  {o.delivery_date && <p className="text-cocoa/70">🎂 Deliver: {new Date(o.delivery_date).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</p>}
                  {o.coupon_code && <p className="text-cocoa/70">🎟️ Coupon: {o.coupon_code} (−{formatPKR(o.discount)})</p>}
                </div>
                <div>
                  <p className="font-bold text-cocoa">Timeline</p>
                  <ul className="mt-1 space-y-1">
                    {(o.timeline || []).map((t, i) => (
                      <li key={i} className="text-xs text-cocoa/60">
                        • {t.status.replace(/_/g, ' ')} — {new Date(t.at).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}
                        {t.note ? ` (${t.note})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="py-12 text-center text-cocoa/50">No orders here yet.</p>}
      </div>
    </div>
  );
}

/* ------------------------------ products ------------------------------ */

interface ProductForm {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  images: string[];
  sizesText: string;
  basePrice?: number;
  badges?: string[];
  inStock?: boolean;
  stock?: number;
  featured?: boolean;
  bestseller?: boolean;
}

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  category: 'Cakes',
  description: '',
  images: [],
  sizesText: '1 lb:1800\n2 lb:3400',
  basePrice: 1800,
  badges: [],
  inStock: true,
  stock: 20,
  featured: false,
  bestseller: false,
};

function ProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await api<unknown[]>('/api/admin/products').catch(() => []);
    setProducts(
      (data as Record<string, unknown>[]).map((p) => ({
        id: String(p.id ?? p._id ?? ''),
        name: String(p.name ?? ''),
        slug: String(p.slug ?? ''),
        category: String(p.category ?? ''),
        description: String(p.description ?? ''),
        images: (p.images as string[]) || [],
        sizes: (p.sizes as { label: string; price: number }[]) || [],
        basePrice: Number(p.basePrice ?? 0),
        oldPrice: p.oldPrice != null ? Number(p.oldPrice) : null,
        rating: Number(p.rating ?? 0),
        reviewsCount: Number(p.reviewsCount ?? 0),
        badges: (p.badges as string[]) || [],
        inStock: !!p.inStock,
        stock: Number(p.stock ?? 0),
        featured: !!p.featured,
        bestseller: !!p.bestseller,
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => setEditing({ ...EMPTY_PRODUCT, images: [] });
  const openEdit = (p: Product) =>
    setEditing({
      id: String(p.id),
      name: p.name,
      category: p.category,
      description: p.description,
      images: [...p.images],
      sizesText: p.sizes.map((s) => `${s.label}:${s.price}`).join('\n'),
      basePrice: p.basePrice,
      badges: p.badges,
      inStock: p.inStock,
      stock: p.stock,
      featured: p.featured,
      bestseller: p.bestseller,
    });

  const parseSizes = (text: string) =>
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [label, price] = l.split(':').map((x) => x.trim());
        return { label, price: Number(price) || 0 };
      })
      .filter((s) => s.label);

  const save = async () => {
    if (!editing || !editing.name?.trim()) {
      toast('Product name is required.', 'error');
      return;
    }
    const sizes = parseSizes(editing.sizesText || '');
    const payload = {
      name: editing.name.trim(),
      category: editing.category,
      description: editing.description,
      images: editing.images,
      sizes,
      basePrice: sizes[0]?.price ?? editing.basePrice ?? 0,
      badges: (editing.badges || []).filter(Boolean),
      inStock: editing.inStock,
      stock: Number(editing.stock) || 0,
      featured: editing.featured,
      bestseller: editing.bestseller,
    };
    try {
      if (editing.id) {
        await api(`/api/admin/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Product updated.', 'success');
      } else {
        await api('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
        toast('Product created! 🎂', 'success');
      }
      setEditing(null);
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Save failed.', 'error');
    }
  };

  const remove = async (id: string | number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      toast('Product deleted.', 'success');
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  const uploadFile = async (file: File) => {
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const data = await api<{ url: string }>('/api/admin/upload', { method: 'POST', body: fd });
      setEditing((e) => (e ? { ...e, images: [...(e.images || []), data.url] } : e));
      toast('Image uploaded.', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div>
      <button onClick={openNew} className="rounded-full bg-raspberry px-7 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg">
        + New product
      </button>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={String(p.id)} className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-cocoa/10">
            <div className="relative aspect-[4/3]">
              <Image src={imgSrc(p.images[0])} alt={p.name} fill className="object-cover" />
              {!p.inStock && (
                <span className="absolute left-3 top-3 rounded-full bg-cocoa px-3 py-1 text-[11px] font-bold uppercase text-cream">Out of stock</span>
              )}
            </div>
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-raspberry">{p.category}</p>
              <p className="font-display text-lg font-bold text-cocoa">{p.name}</p>
              <p className="text-sm text-cocoa/60">{p.sizes.map((s) => `${s.label}: ${formatPKR(s.price)}`).join(' · ')}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 rounded-full bg-cocoa py-2 text-xs font-bold uppercase tracking-widest text-cream">
                  Edit
                </button>
                <button onClick={() => remove(p.id)} className="rounded-full bg-raspberry/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-raspberry">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* editor modal */}
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-cocoa/50 p-4 backdrop-blur-sm">
          <div className="nice-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-cream p-6 md:p-8">
            <h3 className="font-display text-2xl font-black text-cocoa">{editing.id ? 'Edit product' : 'New product'}</h3>
            <div className="mt-5 space-y-4">
              <input
                value={editing.name || ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Product name *"
                className="w-full rounded-2xl border-2 border-cocoa/12 bg-white px-5 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="rounded-2xl border-2 border-cocoa/12 bg-white px-5 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  value={editing.badges?.join(', ') || ''}
                  onChange={(e) => setEditing({ ...editing, badges: e.target.value.split(',').map((x) => x.trim()) })}
                  placeholder="Badges (comma separated)"
                  className="rounded-2xl border-2 border-cocoa/12 bg-white px-5 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none"
                />
              </div>
              <textarea
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full rounded-2xl border-2 border-cocoa/12 bg-white px-5 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cocoa/60">Sizes & prices (one per line: label:price)</p>
                <textarea
                  value={editing.sizesText}
                  onChange={(e) => setEditing({ ...editing, sizesText: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border-2 border-cocoa/12 bg-white px-5 py-3 font-mono text-sm text-cocoa focus:border-raspberry focus:outline-none"
                />
              </div>

              {/* image picker */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cocoa/60">Images</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(editing.images || []).map((im, i) => (
                    <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl ring-2 ring-raspberry">
                      <Image src={imgSrc(im)} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, images: (editing.images || []).filter((_, x) => x !== i) })}
                        className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-raspberry text-[10px] font-bold text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs font-semibold text-cocoa/60">Pick from gallery:</p>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {KNOWN_IMAGES.map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() =>
                        setEditing((e) =>
                          e && !(e.images || []).includes(`/images/${f}`)
                            ? { ...e, images: [...(e.images || []), `/images/${f}`] }
                            : e
                        )
                      }
                      className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-cocoa/15 hover:ring-raspberry"
                      title={f}
                    >
                      <Image src={`/images/${f}`} alt={f} fill className="object-cover" />
                    </button>
                  ))}
                </div>
                <label className="mt-3 inline-block cursor-pointer rounded-full bg-creamDark px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-cocoa hover:bg-caramel">
                  {uploadBusy ? 'Uploading…' : '📤 Upload new image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
                  <input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="w-20 rounded-xl border-2 border-cocoa/12 bg-white px-3 py-2 text-sm" />
                  Stock qty
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
                  <input type="checkbox" checked={!!editing.inStock} onChange={(e) => setEditing({ ...editing, inStock: e.target.checked })} className="h-5 w-5 accent-[#B23A5E]" />
                  In stock
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
                  <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="h-5 w-5 accent-[#B23A5E]" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
                  <input type="checkbox" checked={!!editing.bestseller} onChange={(e) => setEditing({ ...editing, bestseller: e.target.checked })} className="h-5 w-5 accent-[#B23A5E]" />
                  Bestseller
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={save} className="flex-1 rounded-full bg-raspberry py-3.5 text-sm font-bold uppercase tracking-widest text-white">
                  Save product
                </button>
                <button onClick={() => setEditing(null)} className="rounded-full border-2 border-cocoa/15 px-8 py-3.5 text-sm font-bold text-cocoa">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ inquiries ------------------------------ */

function InquiriesTab() {
  const { toast } = useToast();
  const [list, setList] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const q = filter ? `?status=${filter}` : '';
    const data = await api<Inquiry[]>(`/api/admin/inquiries${q}`).catch(() => []);
    setList(data);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, patch: { status?: string; notes?: string }) => {
    try {
      await api(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      toast('Inquiry updated.', 'success');
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['', ...INQUIRY_STATUSES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              filter === s ? 'bg-raspberry text-white' : 'bg-white text-cocoa/60 ring-1 ring-cocoa/15'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {list.map((inq) => (
          <div key={inq.id} className="rounded-[1.5rem] bg-white p-5 ring-1 ring-cocoa/10">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setExpanded(expanded === inq.id ? null : inq.id)} className="flex flex-1 items-center gap-4 text-left">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pinkSoft text-2xl">🎂</span>
                <div>
                  <p className="font-bold text-cocoa">{inq.name} · {inq.occasion}</p>
                  <p className="text-xs text-cocoa/55">
                    {inq.servings} · {inq.flavor} · 📅 {inq.deliveryDate ? new Date(inq.deliveryDate).toLocaleDateString('en-PK', { dateStyle: 'medium' }) : '—'}
                  </p>
                </div>
              </button>
              <select
                value={inq.status}
                onChange={(e) => update(inq.id, { status: e.target.value })}
                className="rounded-full border-2 border-cocoa/12 bg-cream px-4 py-2 text-xs font-bold uppercase tracking-wider text-cocoa focus:border-raspberry focus:outline-none"
              >
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {expanded === inq.id && (
              <div className="mt-4 border-t border-cocoa/10 pt-4 text-sm">
                <p className="font-bold text-cocoa">Design brief</p>
                <p className="mt-1 rounded-2xl bg-cream p-4 text-cocoa/75">“{inq.design}”</p>
                <div className="mt-3 grid gap-2 text-cocoa/70 md:grid-cols-2">
                  <p>📞 {inq.phone}</p>
                  <p>📍 {inq.city}{inq.email ? ` · ${inq.email}` : ''}</p>
                  {inq.created_at && <p>🕐 Received {new Date(inq.created_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-cocoa/60">Admin notes</p>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      defaultValue={inq.notes || ''}
                      id={`notes-${inq.id}`}
                      placeholder="Quote sent, sketch approved…"
                      className="flex-1 rounded-2xl border-2 border-cocoa/12 bg-white px-4 py-2.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`notes-${inq.id}`) as HTMLInputElement | null;
                        update(inq.id, { notes: el?.value || '' });
                      }}
                      className="rounded-2xl bg-cocoa px-5 text-xs font-bold uppercase tracking-widest text-cream"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="py-12 text-center text-cocoa/50">No custom cake inquiries yet.</p>}
      </div>
    </div>
  );
}

/* ------------------------------ coupons ------------------------------ */

function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: '', min_order: '', active: true });

  const load = useCallback(async () => {
    const data = await api<Coupon[]>('/api/admin/coupons').catch(() => []);
    setCoupons(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) {
      toast('Code and value are required.', 'error');
      return;
    }
    try {
      await api('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Number(form.value),
          min_order: Number(form.min_order) || 0,
          active: form.active,
        }),
      });
      toast(`Coupon ${form.code.toUpperCase()} created! 🎟️`, 'success');
      setForm({ code: '', type: 'percent', value: '', min_order: '', active: true });
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Create failed.', 'error');
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await api(`/api/admin/coupons/${c.id}`, { method: 'PUT', body: JSON.stringify({ active: !c.active }) });
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await api(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
      toast('Coupon deleted.', 'success');
      load();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={create} className="h-fit rounded-[1.75rem] bg-white p-6 ring-1 ring-cocoa/10">
        <h3 className="font-display text-xl font-bold text-cocoa">New coupon</h3>
        <div className="mt-4 space-y-3">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE e.g. SWEET10" className="w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-4 py-3 font-mono text-sm font-bold text-cocoa focus:border-raspberry focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })} className="rounded-2xl border-2 border-cocoa/12 bg-cream px-4 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none">
              <option value="percent">% off</option>
              <option value="fixed">Rs off</option>
            </select>
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/\D/g, '') })} placeholder={form.type === 'percent' ? '10' : '500'} inputMode="numeric" className="rounded-2xl border-2 border-cocoa/12 bg-cream px-4 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none" />
          </div>
          <input value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value.replace(/\D/g, '') })} placeholder="Min order (Rs, optional)" inputMode="numeric" className="w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-4 py-3 text-sm text-cocoa focus:border-raspberry focus:outline-none" />
          <label className="flex items-center gap-2 text-sm font-semibold text-cocoa">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-5 w-5 accent-[#B23A5E]" />
            Active
          </label>
          <button type="submit" className="w-full rounded-full bg-raspberry py-3.5 text-sm font-bold uppercase tracking-widest text-white">
            Create coupon
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={String(c.id)} className={`flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-white p-5 ring-1 ring-cocoa/10 ${c.active ? '' : 'opacity-55'}`}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-butter/40 text-2xl">🎟️</span>
            <div className="flex-1">
              <p className="font-mono text-lg font-black tracking-widest text-cocoa">{c.code}</p>
              <p className="text-xs text-cocoa/60">
                {c.type === 'percent' ? `${c.value}% off` : `${formatPKR(c.value)} off`}
                {c.min_order > 0 ? ` · min ${formatPKR(c.min_order)}` : ' · no minimum'}
                {c.used_count != null ? ` · used ${c.used_count}×` : ''}
              </p>
            </div>
            <button onClick={() => toggleActive(c)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest ${c.active ? 'bg-mint/20 text-[#3f6b35]' : 'bg-cocoa/10 text-cocoa/60'}`}>
              {c.active ? 'Active' : 'Paused'}
            </button>
            <button onClick={() => remove(c)} className="rounded-full bg-raspberry/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-raspberry">
              Delete
            </button>
          </div>
        ))}
        {coupons.length === 0 && <p className="py-12 text-center text-cocoa/50">No coupons yet — create your first sweet deal!</p>}
      </div>
    </div>
  );
}
