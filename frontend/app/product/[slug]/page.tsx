'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, normProduct, normProducts, imgSrc, formatPKR } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useCart, useWishlist, useToast } from '@/lib/store-context';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import { Sticker } from '@/components/decor';
import ProductCard from '@/components/ProductCard';
import Stars from '@/components/Stars';
import { validateCakeMessage } from '@/lib/validation';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const [msgError, setMsgError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api<unknown>(`/api/products/${slug}`)
      .then((d) => {
        const raw = d as Record<string, unknown>;
        const p = normProduct((raw.product ?? raw) as Record<string, unknown>);
        if (!p.name) throw new Error('not found');
        setProduct(p);
        setSizeIdx(0);
        setImgIdx(0);
        return api<unknown>('/api/products');
      })
      .then((d) =>
        setRelated(
          normProducts(d)
            .filter((r) => r.slug !== slug)
            .slice(0, 4)
        )
      )
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-[2rem] bg-creamDark" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded-full bg-creamDark" />
            <div className="h-6 w-1/3 animate-pulse rounded-full bg-creamDark" />
            <div className="h-24 animate-pulse rounded-3xl bg-creamDark" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <p className="text-7xl">🧁</p>
        <h1 className="mt-6 font-display text-4xl font-bold text-cocoa">This treat is all gone</h1>
        <p className="mt-3 text-cocoa/60">The cake you are looking for doesn&apos;t exist (anymore).</p>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-raspberry px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white">
          Back to the shelf
        </Link>
      </div>
    );
  }

  const wished = has(product.slug);
  const size = product.sizes[sizeIdx] ?? { label: '', price: product.basePrice };
  const isCustom = product.category === 'Custom Cakes';

  const handleAdd = () => {
    const err = validateCakeMessage(message.trim());
    setMsgError(err);
    if (err) return;
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: size.price,
      image: product.images[0] ?? '',
      size: size.label,
      cakeMessage: message.trim() || undefined,
      qty,
    });
    toast(`${product.name} added to your box!`, 'success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <Link href="/shop" className="text-sm font-bold uppercase tracking-[0.18em] text-cocoa/50 hover:text-raspberry">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
        {/* gallery */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-cocoa/10">
            <div className="relative aspect-square">
              <Image
                key={imgIdx}
                src={imgSrc(product.images[imgIdx] ?? product.images[0])}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
            </div>
            {product.badges[0] && (
              <div className="absolute left-5 top-5">
                <Sticker color="raspberry" rotate={-6}>{product.badges[0]}</Sticker>
              </div>
            )}
            {product.bestseller && (
              <div className="absolute right-5 top-5">
                <Sticker color="butter" rotate={6}>Bestseller</Sticker>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl ring-2 transition-all ${
                    i === imgIdx ? 'ring-raspberry' : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={imgSrc(im)} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {/* info */}
        <div>
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-raspberry">{product.category}</p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight text-cocoa md:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <Stars value={product.rating} size={17} />
              <span className="text-sm text-cocoa/60">{product.rating.toFixed(1)} · {product.reviewsCount} reviews</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 leading-relaxed text-cocoa/75">{product.description}</p>
          </Reveal>

          {/* size selector */}
          {product.sizes.length > 0 && (
            <Reveal delay={0.15} className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">
                Choose your size
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSizeIdx(i)}
                    className={`rounded-2xl border-2 px-6 py-3.5 text-left transition-all ${
                      i === sizeIdx
                        ? 'border-raspberry bg-pinkSoft shadow-md'
                        : 'border-cocoa/12 bg-white hover:border-cocoa/30'
                    }`}
                  >
                    <span className="block font-display text-lg font-bold text-cocoa">{s.label}</span>
                    <span className="block text-sm font-semibold text-raspberry">{formatPKR(s.price)}</span>
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {/* message on cake */}
          <Reveal delay={0.2} className="mt-7">
            <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">
              Message on the cake <span className="font-medium normal-case tracking-normal">(optional)</span>
            </label>
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setMsgError(validateCakeMessage(e.target.value));
              }}
              onBlur={() => setMsgError(validateCakeMessage(message.trim()))}
              placeholder={isCustom ? 'e.g. Happy Birthday Ayesha!' : 'e.g. Happy Anniversary!'}
              maxLength={45}
              className={`mt-3 w-full rounded-2xl border-2 bg-white px-5 py-3.5 text-sm text-cocoa placeholder:text-cocoa/35 focus:outline-none ${
                msgError ? 'border-raspberry' : 'border-cocoa/12 focus:border-raspberry'
              }`}
            />
            {msgError && <p className="mt-1.5 text-xs font-semibold text-raspberry">{msgError}</p>}
            {!msgError && (
              <p className="mt-1.5 text-xs text-cocoa/50">We hand-pipe it in elegant script — free of charge.</p>
            )}
          </Reveal>

          {/* qty + add */}
          <Reveal delay={0.25} className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 ring-1 ring-cocoa/15">
              <button
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-creamDark text-lg font-bold text-cocoa"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-8 text-center font-display text-xl font-bold text-cocoa">{qty}</span>
              <button
                onClick={() => setQty((v) => Math.min(20, v + 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-creamDark text-lg font-bold text-cocoa"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-cocoa">{formatPKR(size.price * qty)}</p>
              {product.oldPrice && (
                <p className="text-sm text-cocoa/50 line-through">{formatPKR(product.oldPrice * qty)}</p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.3} className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="btn-shimmer flex-1 rounded-full bg-raspberry px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-xl transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {product.inStock ? 'Add to box 🧁' : 'Sold out'}
            </button>
            <button
              onClick={() => {
                toggle(product.slug);
                toast(wished ? 'Removed from wishlist' : 'Saved to your wishlist ♥', 'success');
              }}
              aria-label="Toggle wishlist"
              className={`grid h-[52px] w-[52px] place-items-center rounded-full ring-1 transition-all ${
                wished ? 'bg-raspberry text-white ring-raspberry' : 'bg-white text-cocoa ring-cocoa/15 hover:bg-pinkSoft'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.4 3.6 3.8 6.7C19.5 16.3 12 21 12 21z" transform="scale(0.92) translate(1,0)" />
              </svg>
            </button>
          </Reveal>

          <Reveal delay={0.35} className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { e: '🚚', t: 'Karachi-wide delivery' },
              { e: '💵', t: 'COD & bank transfer' },
              { e: '🎂', t: 'Baked fresh to order' },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl bg-creamDark/70 px-2 py-4">
                <p className="text-2xl">{b.e}</p>
                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-cocoa/70">{b.t}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-24">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-cocoa md:text-4xl">
              You may also <span className="italic text-raspberry">crave</span>
            </h2>
          </Reveal>
          <Stagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.07}>
            {related.map((p) => (
              <StaggerItem key={String(p.id)}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )}
    </div>
  );
}
