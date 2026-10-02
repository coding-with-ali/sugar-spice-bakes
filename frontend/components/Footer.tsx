'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/store-context';

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast('Please enter a valid email.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      toast('Sweet! You are on the list — enjoy 10% off your first order.', 'success');
      setEmail('');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Could not subscribe.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-cocoa text-cream">
      {/* newsletter band */}
      <div className="border-b border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 md:flex-row md:justify-between md:px-8">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-caramel">The Sweet Letter</p>
            <h3 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Get 10% off your first order
            </h3>
            <p className="mt-2 text-cream/60">Fresh bakes, secret flavours & subscriber-only treats.</p>
          </div>
          <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-13 flex-1 rounded-full border border-cream/20 bg-cream/10 px-5 py-3.5 text-sm text-cream placeholder:text-cream/40 focus:border-caramel focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-raspberry px-7 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-transform hover:scale-105 disabled:opacity-60"
            >
              {busy ? '…' : 'Join'}
            </button>
          </form>
        </div>
      </div>

      {/* links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-display text-2xl font-bold">
            Sugar <span className="text-raspberry">&</span> Spice <span className="text-caramel text-lg">Bakes</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/60">
            Karachi&apos;s home bakery for celebration cakes, cupcakes & custom bakes — made fresh to order, delivered with love.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-caramel">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li><Link href="/shop" className="hover:text-cream">All treats</Link></li>
            <li><Link href="/shop?cat=Cakes" className="hover:text-cream">Cakes</Link></li>
            <li><Link href="/shop?cat=Cupcakes" className="hover:text-cream">Cupcakes</Link></li>
            <li><Link href="/custom" className="hover:text-cream">Custom cakes</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-caramel">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li><Link href="/track" className="hover:text-cream">Track your order</Link></li>
            <li><Link href="/cart" className="hover:text-cream">Your cart</Link></li>
            <li><Link href="/account" className="hover:text-cream">Account</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-caramel">Visit us</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>Karachi, Pakistan</li>
            <li>WhatsApp: 0300-0000000</li>
            <li>Open daily · 10am – 10pm</li>
          </ul>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="select-none overflow-hidden px-4" aria-hidden>
        <p className="whitespace-nowrap text-center font-display text-[13.5vw] font-bold leading-[0.9] text-cream/[0.07]">
          SUGAR & SPICE
        </p>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-cream/40 md:px-8">
          © {new Date().getFullYear()} Sugar & Spice Bakes · Baked with love in Karachi
        </p>
      </div>
    </footer>
  );
}
