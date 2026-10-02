'use client';

import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, imgSrc, formatPKR } from '@/lib/api';
import { normalizePhone, validatePhone } from '@/lib/validation';
import { useToast } from '@/lib/store-context';
import { Reveal } from '@/components/motion';
import { Sticker } from '@/components/decor';
import type { Order } from '@/lib/types';

const STATUS_STEPS = ['pending', 'baking', 'out_for_delivery', 'delivered'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order received',
  baking: 'In the oven',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function TrackInner() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [orderNo, setOrderNo] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanNo = orderNo.trim().toUpperCase();
    if (!cleanNo) {
      toast('Please enter your order number.', 'error');
      return;
    }
    const perr = validatePhone(phone);
    setPhoneError(perr);
    if (perr) return;
    setBusy(true);
    try {
      const data = await api<Order>(`/api/orders/track/${cleanNo}?phone=${normalizePhone(phone)}`);
      setOrder(data);
    } catch (err: unknown) {
      setOrder(null);
      toast(err instanceof Error ? err.message : 'Order not found.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const stepIdx = order ? STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <Reveal className="text-center">
        <Sticker color="caramel" rotate={-3}>📦 Where&apos;s my cake?</Sticker>
        <h1 className="mt-5 font-display text-5xl font-black text-cocoa">Track your order</h1>
        <p className="mt-3 text-cocoa/60">Enter your order number (e.g. SSB-AB12CD) and the mobile number you ordered with.</p>
      </Reveal>

      <Reveal delay={0.1}>
        <form onSubmit={lookup} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value.toUpperCase())}
            placeholder="SSB-XXXXXX"
            className="flex-1 rounded-full border-2 border-cocoa/12 bg-white px-6 py-3.5 text-center font-mono text-sm font-bold tracking-widest text-cocoa focus:border-raspberry focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 11));
              setPhoneError(validatePhone(e.target.value));
            }}
            placeholder="03001234567"
            inputMode="numeric"
            className={`flex-1 rounded-full border-2 bg-white px-6 py-3.5 text-center text-sm font-bold text-cocoa focus:outline-none ${
              phoneError ? 'border-raspberry' : 'border-cocoa/12 focus:border-raspberry'
            }`}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-cocoa px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-cream disabled:opacity-60"
          >
            {busy ? '…' : 'Track'}
          </button>
        </form>
        {phoneError && <p className="mt-2 text-center text-xs font-semibold text-raspberry">{phoneError}</p>}
      </Reveal>

      {order && (
        <Reveal className="mt-10 rounded-[2rem] bg-white p-6 ring-1 ring-cocoa/10 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-sm font-bold tracking-widest text-cocoa/50">{order.order_number}</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-cocoa">
                {STATUS_LABELS[order.status] || order.status}
              </h2>
            </div>
            <span className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest ${
              order.status === 'cancelled' ? 'bg-raspberry/15 text-raspberry' : 'bg-mint/20 text-[#3f6b35]'
            }`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* pipeline */}
          {order.status !== 'cancelled' && (
            <div className="mt-8">
              <div className="flex items-center">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`grid h-11 w-11 place-items-center rounded-full text-lg font-bold ${
                        i <= stepIdx ? 'bg-raspberry text-white' : 'bg-creamDark text-cocoa/40'
                      }`}>
                        {i <= stepIdx ? '✓' : i + 1}
                      </div>
                      <p className={`mt-2 text-center text-[11px] font-bold uppercase tracking-wide ${i <= stepIdx ? 'text-raspberry' : 'text-cocoa/40'}`}>
                        {STATUS_LABELS[s]}
                      </p>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`mx-2 mb-6 h-1 flex-1 rounded-full ${i < stepIdx ? 'bg-raspberry' : 'bg-creamDark'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* timeline */}
          <div className="mt-8 space-y-3">
            {(order.timeline || []).map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
                <span className="text-lg">🧁</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-cocoa">{STATUS_LABELS[t.status] || t.status}</p>
                  {t.note && <p className="text-xs text-cocoa/55">{t.note}</p>}
                </div>
                <p className="text-xs text-cocoa/45">{new Date(t.at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            ))}
          </div>

          {/* items */}
          <div className="mt-8 border-t border-cocoa/10 pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Your treats</p>
            <ul className="mt-4 space-y-3">
              {(order.items || []).map((it, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <Image src={imgSrc(it.image)} alt={it.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-cocoa">{it.name}</p>
                    <p className="text-xs text-cocoa/55">{it.size} × {it.qty}{it.cakeMessage ? ` · “${it.cakeMessage}”` : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-cocoa">{formatPKR(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-cocoa/10 pt-4">
              <span className="font-bold text-cocoa">Total paid</span>
              <span className="font-display text-2xl font-black text-raspberry">{formatPKR(order.total)}</span>
            </div>
            {order.delivery_date && (
              <p className="mt-2 text-sm text-cocoa/60">
                🎂 Delivery date: <strong>{new Date(order.delivery_date).toLocaleDateString('en-PK', { dateStyle: 'long' })}</strong>
              </p>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-cocoa/60">Loading…</div>}>
      <TrackInner />
    </Suspense>
  );
}
