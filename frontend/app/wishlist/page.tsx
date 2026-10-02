'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, normProducts, imgSrc } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useWishlist, useCart, useToast } from '@/lib/store-context';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { formatPKR } from '@/lib/api';

export default function WishlistPage() {
  const { slugs, toggle } = useWishlist();
  const { add } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api<unknown>('/api/products')
      .then((d) => setProducts(normProducts(d)))
      .catch(() => {});
  }, []);

  const saved = products.filter((p) => slugs.includes(p.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">Saved for later</p>
        <h1 className="mt-3 font-display text-5xl font-black text-cocoa">Wishlist ♥</h1>
      </Reveal>

      {saved.length === 0 ? (
        <Reveal className="mt-12 rounded-[2rem] bg-white p-14 text-center ring-1 ring-cocoa/10">
          <p className="text-7xl">💝</p>
          <h2 className="mt-6 font-display text-3xl font-bold text-cocoa">No saved treats yet</h2>
          <p className="mt-2 text-cocoa/60">Tap the heart on any treat to save it here.</p>
          <Link href="/shop" className="mt-8 inline-block rounded-full bg-raspberry px-10 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white">
            Find something sweet
          </Link>
        </Reveal>
      ) : (
        <Stagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.07}>
          {saved.map((p) => {
            const price = p.sizes[0]?.price ?? p.basePrice;
            return (
              <StaggerItem key={String(p.id)}>
                <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-cocoa/10">
                  <Link href={`/product/${p.slug}`} className="relative block aspect-[4/3] overflow-hidden">
                    <Image src={imgSrc(p.images[0])} alt={p.name} fill className="object-cover" />
                  </Link>
                  <div className="p-5">
                    <Link href={`/product/${p.slug}`} className="font-display text-xl font-bold text-cocoa hover:underline">
                      {p.name}
                    </Link>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-display text-xl font-black text-cocoa">{formatPKR(price)}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            add({ id: p.id, slug: p.slug, name: p.name, price, image: p.images[0] ?? '', size: p.sizes[0]?.label ?? '', qty: 1 });
                            toast(`${p.name} added to your box!`, 'success');
                          }}
                          className="rounded-full bg-cocoa px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-cream hover:bg-raspberry"
                        >
                          Add +
                        </button>
                        <button
                          onClick={() => toggle(p.slug)}
                          aria-label="Remove from wishlist"
                          className="grid h-10 w-10 place-items-center rounded-full bg-pinkSoft text-raspberry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
