'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/store-context';
import { imgSrc, formatPKR, shippingFor, FREE_SHIPPING_THRESHOLD } from '@/lib/api';
import { Reveal } from '@/components/motion';

export default function CartPage() {
  const { items, updateQty, removeAt, subtotal, clear } = useCart();
  const shipping = shippingFor(subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">Your sweet box</p>
        <h1 className="mt-3 font-display text-5xl font-black text-cocoa">Cart</h1>
      </Reveal>

      {items.length === 0 ? (
        <Reveal className="mt-12 rounded-[2rem] bg-white p-14 text-center ring-1 ring-cocoa/10">
          <p className="text-7xl">🧁</p>
          <h2 className="mt-6 font-display text-3xl font-bold text-cocoa">Nothing in your box yet</h2>
          <p className="mt-2 text-cocoa/60">Warm, fresh bakes are waiting on the shelf.</p>
          <Link href="/shop" className="mt-8 inline-block rounded-full bg-raspberry px-10 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white">
            Browse treats
          </Link>
        </Reveal>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {/* free shipping bar */}
            <div className="rounded-3xl bg-white p-5 ring-1 ring-cocoa/10">
              <p className="text-sm font-semibold text-cocoa">
                {shipping === 0 ? (
                  <>🎉 You unlocked <strong className="text-raspberry">FREE delivery!</strong></>
                ) : (
                  <>Add <strong className="text-raspberry">{formatPKR(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> more for FREE delivery</>
                )}
              </p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-creamDark">
                <div className="h-full rounded-full bg-gradient-to-r from-caramel to-raspberry transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {items.map((it, idx) => (
              <div key={`${it.id}-${it.size}-${it.cakeMessage || ''}`} className="flex gap-4 rounded-[1.75rem] bg-white p-4 ring-1 ring-cocoa/10">
                <Link href={`/product/${it.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={imgSrc(it.image)} alt={it.name} fill className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${it.slug}`} className="font-display text-lg font-bold text-cocoa hover:underline">
                    {it.name}
                  </Link>
                  <p className="text-xs text-cocoa/60">
                    {it.size}
                    {it.cakeMessage ? ` · “${it.cakeMessage}”` : ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-creamDark px-2 py-1">
                      <button onClick={() => updateQty(idx, it.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white font-bold text-cocoa shadow-sm" aria-label="Decrease">−</button>
                      <span className="min-w-6 text-center font-bold text-cocoa">{it.qty}</span>
                      <button onClick={() => updateQty(idx, it.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-white font-bold text-cocoa shadow-sm" aria-label="Increase">+</button>
                    </div>
                    <p className="font-display text-xl font-bold text-cocoa">{formatPKR(it.price * it.qty)}</p>
                  </div>
                </div>
                <button onClick={() => removeAt(idx)} aria-label="Remove" className="self-start text-xl text-cocoa/30 hover:text-raspberry">×</button>
              </div>
            ))}

            <button onClick={clear} className="text-sm font-semibold text-cocoa/50 underline hover:text-raspberry">
              Clear whole box
            </button>
          </div>

          {/* summary */}
          <Reveal className="h-fit rounded-[2rem] bg-cocoa p-7 text-cream lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-bold">Order summary</h2>
            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-cream/70"><span>Subtotal</span><span className="font-semibold text-cream">{formatPKR(subtotal)}</span></div>
              <div className="flex justify-between text-cream/70"><span>Delivery</span><span className="font-semibold text-cream">{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span></div>
              <div className="border-t border-cream/15 pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-display text-2xl font-black text-caramel">{formatPKR(subtotal + shipping)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-shimmer mt-6 block rounded-full bg-raspberry py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-white">
              Checkout →
            </Link>
            <Link href="/shop" className="mt-3 block text-center text-sm font-semibold text-cream/60 hover:text-cream">
              ← Keep shopping
            </Link>
          </Reveal>
        </div>
      )}
    </div>
  );
}
