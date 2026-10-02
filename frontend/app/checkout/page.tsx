'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { api, imgSrc, formatPKR, minDeliveryDate, shippingFor } from '@/lib/api';
import { useCart, useToast } from '@/lib/store-context';
import { Reveal } from '@/components/motion';
import {
  PK_CITIES,
  validateShippingForm,
  normalizePhone,
  type ShippingForm,
} from '@/lib/validation';

type PayMethod = 'cod' | 'bank';

const EMPTY: ShippingForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postal: '',
  deliveryDate: '',
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState<ShippingForm>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [pay, setPay] = useState<PayMethod>('cod');
  const [coupon, setCoupon] = useState('');
  const [couponInfo, setCouponInfo] = useState<{ code: string; discount: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [busy, setBusy] = useState(false);

  const errors = useMemo(() => validateShippingForm(form), [form]);
  const show = (k: keyof ShippingForm) => (touched[k] ? errors[k] : null);

  const set = (k: keyof ShippingForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: keyof ShippingForm) => setTouched((t) => ({ ...t, [k]: true }));

  const discount = couponInfo?.discount ?? 0;
  const shipping = shippingFor(subtotal - discount);
  const total = subtotal - discount + shipping;

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await api<{ ok: boolean; discount: number; code: string }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      });
      setCouponInfo({ code: res.code, discount: res.discount });
      toast(`Coupon ${res.code} applied — you save ${formatPKR(res.discount)}!`, 'success');
    } catch (err: unknown) {
      setCouponInfo(null);
      toast(err instanceof Error ? err.message : 'Invalid coupon.', 'error');
    } finally {
      setCouponBusy(false);
    }
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const keys = Object.keys(form) as (keyof ShippingForm)[];
    setTouched(Object.fromEntries(keys.map((k) => [k, true])));
    if (keys.some((k) => errors[k])) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    if (items.length === 0) {
      toast('Your box is empty.', 'error');
      return;
    }
    setBusy(true);
    try {
      const res = await api<{ ok: boolean; order_number: string; total: number }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            qty: i.qty,
            size: i.size,
            cakeMessage: i.cakeMessage,
          })),
          payment_method: pay,
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: normalizePhone(form.phone),
          address: form.address.trim(),
          city: form.city,
          postal: form.postal.trim() || undefined,
          deliveryDate: form.deliveryDate,
          coupon: couponInfo?.code,
        }),
      });
      clear();
      router.push(`/track?order=${res.order_number}`);
      toast(`Order ${res.order_number} placed! 🎂`, 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Checkout failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = (bad: string | null) =>
    `w-full rounded-2xl border-2 bg-white px-5 py-3.5 text-sm text-cocoa placeholder:text-cocoa/35 focus:outline-none ${
      bad ? 'border-raspberry' : 'border-cocoa/12 focus:border-raspberry'
    }`;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <p className="text-7xl">🧁</p>
        <h1 className="mt-6 font-display text-4xl font-bold text-cocoa">Your box is empty</h1>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-raspberry px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white">
          Back to the shelf
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">Almost there</p>
        <h1 className="mt-3 font-display text-5xl font-black text-cocoa">Checkout</h1>
      </Reveal>

      <form onSubmit={placeOrder} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* details */}
        <div className="space-y-8">
          <Reveal className="rounded-[2rem] bg-white p-6 ring-1 ring-cocoa/10 md:p-8">
            <h2 className="font-display text-2xl font-bold text-cocoa">1 · Delivery details</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">Full name *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')} placeholder="e.g. Ayesha Khan" className={`mt-2 ${inputCls(show('name'))}`} />
                {show('name') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('name')}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">Mobile number *</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 11))} onBlur={() => blur('phone')} placeholder="03001234567" inputMode="numeric" className={`mt-2 ${inputCls(show('phone'))}`} />
                {show('phone') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('phone')}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">Street address *</label>
                <input value={form.address} onChange={(e) => set('address', e.target.value)} onBlur={() => blur('address')} placeholder="House, street, area…" className={`mt-2 ${inputCls(show('address'))}`} />
                {show('address') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('address')}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">City *</label>
                <select value={form.city} onChange={(e) => set('city', e.target.value)} onBlur={() => blur('city')} className={`mt-2 ${inputCls(show('city'))}`}>
                  <option value="">Select city</option>
                  {PK_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {show('city') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('city')}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">Postal code <span className="normal-case tracking-normal">(optional)</span></label>
                <input value={form.postal} onChange={(e) => set('postal', e.target.value.replace(/\D/g, '').slice(0, 5))} onBlur={() => blur('postal')} placeholder="75500" inputMode="numeric" className={`mt-2 ${inputCls(show('postal'))}`} />
                {show('postal') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('postal')}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">Email <span className="normal-case tracking-normal">(optional)</span></label>
                <input value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} placeholder="you@example.com" className={`mt-2 ${inputCls(show('email'))}`} />
                {show('email') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('email')}</p>}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-cocoa/60">Delivery date *</label>
                <input type="date" value={form.deliveryDate} min={minDeliveryDate()} onChange={(e) => set('deliveryDate', e.target.value)} onBlur={() => blur('deliveryDate')} className={`mt-2 ${inputCls(show('deliveryDate'))}`} />
                {show('deliveryDate') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('deliveryDate')}</p>}
                <p className="mt-1.5 text-xs text-cocoa/50">We bake fresh to order — pick any day from tomorrow.</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="rounded-[2rem] bg-white p-6 ring-1 ring-cocoa/10 md:p-8">
            <h2 className="font-display text-2xl font-bold text-cocoa">2 · Payment method</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setPay('cod')}
                className={`rounded-3xl border-2 p-5 text-left transition-all ${pay === 'cod' ? 'border-raspberry bg-pinkSoft shadow-md' : 'border-cocoa/12 hover:border-cocoa/30'}`}
              >
                <p className="text-3xl">💵</p>
                <p className="mt-2 font-display text-lg font-bold text-cocoa">Cash on Delivery</p>
                <p className="text-xs text-cocoa/60">Pay in cash when your cakes arrive.</p>
              </button>
              <button
                type="button"
                onClick={() => setPay('bank')}
                className={`rounded-3xl border-2 p-5 text-left transition-all ${pay === 'bank' ? 'border-raspberry bg-pinkSoft shadow-md' : 'border-cocoa/12 hover:border-cocoa/30'}`}
              >
                <p className="text-3xl">🏦</p>
                <p className="mt-2 font-display text-lg font-bold text-cocoa">Bank Transfer</p>
                <p className="text-xs text-cocoa/60">We&apos;ll share account details on WhatsApp after you order.</p>
              </button>
            </div>
          </Reveal>
        </div>

        {/* summary */}
        <Reveal className="h-fit rounded-[2rem] bg-cocoa p-7 text-cream lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-bold">Your box</h2>
          <ul className="nice-scroll mt-4 max-h-56 space-y-3 overflow-y-auto">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <Image src={imgSrc(it.image)} alt={it.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-cream/50">{it.size} × {it.qty}</p>
                </div>
                <p className="text-sm font-bold">{formatPKR(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>

          {/* coupon */}
          <div className="mt-5">
            {couponInfo ? (
              <div className="flex items-center justify-between rounded-2xl bg-mint/20 px-4 py-3 ring-1 ring-mint/40">
                <span className="text-sm font-bold text-mint">{couponInfo.code} · −{formatPKR(couponInfo.discount)}</span>
                <button type="button" onClick={() => { setCouponInfo(null); setCoupon(''); }} className="text-cream/60 hover:text-cream">✕</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 rounded-2xl border border-cream/20 bg-cream/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-caramel focus:outline-none"
                />
                <button type="button" onClick={applyCoupon} disabled={couponBusy} className="rounded-2xl bg-caramel px-5 text-sm font-bold text-cocoa disabled:opacity-50">
                  {couponBusy ? '…' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-cream/70"><span>Subtotal</span><span className="font-semibold text-cream">{formatPKR(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-mint"><span>Discount</span><span className="font-semibold">−{formatPKR(discount)}</span></div>}
            <div className="flex justify-between text-cream/70"><span>Delivery</span><span className="font-semibold text-cream">{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span></div>
            <div className="flex justify-between border-t border-cream/15 pt-3">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-black text-caramel">{formatPKR(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn-shimmer mt-6 w-full rounded-full bg-raspberry py-4 text-sm font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
          >
            {busy ? 'Placing order…' : `Place order · ${formatPKR(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-cream/50">No account needed — guest checkout, just like Daraz.</p>
        </Reveal>
      </form>
    </div>
  );
}
