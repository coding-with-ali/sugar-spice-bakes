'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from './motion';
import { useCart, useWishlist } from '@/lib/store-context';
import { imgSrc, formatPKR } from '@/lib/api';
import Stars from './Stars';
import type { Product } from '@/lib/types';

export default function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.slug);
  const price = product.sizes[0]?.price ?? product.basePrice;

  const quickAdd = () => {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: product.images[0] ?? '',
      size: product.sizes[0]?.label ?? '',
      qty: 1,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`group relative overflow-hidden rounded-[1.75rem] ${
        dark ? 'bg-cream/[0.06] ring-1 ring-cream/10' : 'bg-white ring-1 ring-cocoa/10'
      } shadow-[0_18px_50px_-20px_rgba(59,36,23,0.35)]`}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3.4] overflow-hidden">
          <Image
            src={imgSrc(product.images[0])}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-108"
          />
          {product.badges[0] && (
            <span className="absolute left-4 top-4 -rotate-6 rounded-full bg-raspberry px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg">
              {product.badges[0]}
            </span>
          )}
          {product.bestseller && (
            <span className="absolute right-4 top-4 rotate-6 rounded-full bg-butter px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-cocoa shadow-lg">
              Bestseller
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggle(product.slug)}
        aria-label="Toggle wishlist"
        className={`absolute right-4 top-[52%] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full shadow-md transition-all ${
          wished ? 'bg-raspberry text-white' : 'bg-cream text-cocoa hover:bg-pinkSoft'
        }`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.4 3.6 3.8 6.7C19.5 16.3 12 21 12 21z" transform="scale(0.92) translate(1,0)" />
        </svg>
      </button>

      <div className="p-5">
        <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${dark ? 'text-caramel' : 'text-raspberry'}`}>
          {product.category}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className={`mt-1.5 font-display text-xl font-semibold leading-snug hover:underline ${dark ? 'text-cream' : 'text-cocoa'}`}>
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={product.rating} />
          <span className={`text-xs ${dark ? 'text-cream/50' : 'text-cocoa/50'}`}>({product.reviewsCount})</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className={`font-display text-2xl font-bold ${dark ? 'text-cream' : 'text-cocoa'}`}>
              {formatPKR(price)}
            </p>
            {product.sizes[0] && (
              <p className={`text-xs ${dark ? 'text-cream/50' : 'text-cocoa/50'}`}>from · {product.sizes[0].label}</p>
            )}
          </div>
          <button
            onClick={quickAdd}
            className="rounded-full bg-cocoa px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-cream transition-all hover:bg-raspberry hover:text-white active:scale-95"
          >
            Add +
          </button>
        </div>
      </div>

    </motion.div>
  );
}
