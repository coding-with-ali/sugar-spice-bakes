'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, imgSrc, formatPKR } from '@/lib/api';
import { useAuth, useToast } from '@/lib/store-context';
import { Reveal } from '@/components/motion';
import { validateName, validateEmail, normalizePhone, validatePhone } from '@/lib/validation';
import type { Order, User } from '@/lib/types';

export default function AccountPage() {
  const { user, login, register, logout, loading } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      api<Order[]>('/api/orders/mine')
        .then(setOrders)
        .catch(() => {});
    }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (validateEmail(cleanEmail)) {
      toast('Please enter a valid email address.', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (mode === 'register') {
      const nerr = validateName(name);
      if (nerr) {
        toast(nerr, 'error');
        return;
      }
      const perr = phone ? validatePhone(phone) : null;
      if (perr) {
        toast(perr, 'error');
        return;
      }
    }
    setBusy(true);
    try {
      const u: User =
        mode === 'login'
          ? await login(cleanEmail, password)
          : await register(name.trim(), cleanEmail, password, phone ? normalizePhone(phone) : undefined);
      toast(`Welcome${u.name ? `, ${u.name.split(' ')[0]}` : ''}! 🎂`, 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Something went wrong.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="py-28 text-center text-cocoa/60">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 md:py-20">
        <Reveal className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-cocoa/10 md:p-10">
          <p className="text-center text-5xl">🧁</p>
          <h1 className="mt-4 text-center font-display text-3xl font-black text-cocoa">
            {mode === 'login' ? 'Welcome back, sweetie' : 'Join the sweet club'}
          </h1>
          <div className="mt-6 grid grid-cols-2 rounded-full bg-creamDark p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full py-2.5 text-sm font-bold capitalize transition-all ${
                  mode === m ? 'bg-cocoa text-cream shadow' : 'text-cocoa/60'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-5 py-3.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="Mobile (optional) — 03001234567"
                  inputMode="numeric"
                  className="w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-5 py-3.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
                />
              </>
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-5 py-3.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              type="password"
              className="w-full rounded-2xl border-2 border-cocoa/12 bg-cream px-5 py-3.5 text-sm text-cocoa focus:border-raspberry focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-shimmer w-full rounded-full bg-raspberry py-4 text-sm font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
            >
              {busy ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-cocoa/50">
            Ordering as a guest? No account needed at checkout.
          </p>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <Reveal className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">Your sweet account</p>
          <h1 className="mt-2 font-display text-4xl font-black text-cocoa">Hello, {user.name.split(' ')[0]}! 🎂</h1>
        </div>
        <button
          onClick={() => {
            logout();
            toast('Signed out. See you soon!');
          }}
          className="rounded-full border-2 border-cocoa/15 px-6 py-2.5 text-sm font-bold text-cocoa hover:bg-cocoa hover:text-cream"
        >
          Sign out
        </button>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <h2 className="font-display text-2xl font-bold text-cocoa">Order history</h2>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-[2rem] bg-white p-10 text-center ring-1 ring-cocoa/10">
            <p className="text-5xl">🍰</p>
            <p className="mt-4 font-semibold text-cocoa">No orders yet — your sweetest chapter awaits.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-raspberry px-8 py-3 text-sm font-bold uppercase tracking-widest text-white">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((o) => (
              <Link
                key={String(o.id)}
                href={`/track?order=${o.order_number}`}
                className="flex items-center gap-4 rounded-[1.75rem] bg-white p-4 ring-1 ring-cocoa/10 transition-transform hover:-translate-y-1"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={imgSrc(o.items?.[0]?.image)} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-xs font-bold tracking-widest text-cocoa/50">{o.order_number}</p>
                  <p className="text-sm font-semibold text-cocoa">
                    {(o.items || []).map((i) => `${i.name} ×${i.qty}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-black text-cocoa">{formatPKR(o.total)}</p>
                  <span className="mt-1 inline-block rounded-full bg-creamDark px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cocoa/70">
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
