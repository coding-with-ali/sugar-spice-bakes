'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from './motion';
import { useCart } from '@/lib/store-context';
import { imgSrc, formatPKR, shippingFor, FREE_SHIPPING_THRESHOLD } from '@/lib/api';

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeAt, subtotal } = useCart();
  const shipping = shippingFor(subtotal);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[90] bg-cocoa/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-cocoa/10 px-6 py-5">
              <h2 className="font-display text-2xl font-bold text-cocoa">
                Your Box <span className="text-raspberry">({items.reduce((a, i) => a + i.qty, 0)})</span>
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="grid h-10 w-10 place-items-center rounded-full bg-cocoa/5 text-cocoa transition-colors hover:bg-cocoa/10"
              >
                ✕
              </button>
            </div>

            <div className="nice-scroll flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-6xl">🧁</span>
                  <p className="mt-4 font-display text-2xl font-semibold text-cocoa">Your box is empty</p>
                  <p className="mt-2 text-sm text-cocoa/60">Warm, fresh bakes are waiting…</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-raspberry px-8 py-3 text-sm font-bold uppercase tracking-widest text-white"
                  >
                    Browse treats
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((it, idx) => (
                      <motion.li
                        key={`${it.id}-${it.size}-${it.cakeMessage || ''}`}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        className="flex gap-4 rounded-3xl bg-white p-3 ring-1 ring-cocoa/10"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                          <Image src={imgSrc(it.image)} alt={it.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-base font-semibold text-cocoa">{it.name}</p>
                          <p className="text-xs text-cocoa/60">
                            {it.size}
                            {it.cakeMessage ? ` · “${it.cakeMessage}”` : ''}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full bg-creamDark px-2 py-1">
                              <button
                                onClick={() => updateQty(idx, it.qty - 1)}
                                className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-cocoa shadow-sm"
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="min-w-5 text-center text-sm font-bold text-cocoa">{it.qty}</span>
                              <button
                                onClick={() => updateQty(idx, it.qty + 1)}
                                className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-cocoa shadow-sm"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <p className="font-display text-lg font-bold text-cocoa">{formatPKR(it.price * it.qty)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAt(idx)}
                          aria-label="Remove item"
                          className="self-start text-lg text-cocoa/30 transition-colors hover:text-raspberry"
                        >
                          ×
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-cocoa/10 bg-white px-6 py-5">
                <div className="flex justify-between text-sm text-cocoa/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-cocoa">{formatPKR(subtotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm text-cocoa/70">
                  <span>Delivery</span>
                  <span className="font-semibold text-cocoa">
                    {shipping === 0 ? 'FREE 🍰' : formatPKR(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="mt-2 text-xs text-raspberry">
                    Add {formatPKR(FREE_SHIPPING_THRESHOLD - subtotal)} more for FREE delivery
                  </p>
                )}
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="btn-shimmer mt-4 block rounded-full bg-raspberry py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.02]"
                >
                  Checkout →
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
