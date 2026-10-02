'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, normProducts } from '@/lib/api';
import type { Product } from '@/lib/types';
import { CATEGORIES } from '@/lib/api';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';
import ProductCard from '@/components/ProductCard';

type SortKey = 'pop' | 'low' | 'high' | 'new';

function ShopInner() {
  const params = useSearchParams();
  const initialCat = params.get('cat') || 'All';
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('pop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<unknown>('/api/products')
      .then((d) => setProducts(normProducts(d)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const c = params.get('cat');
    if (c) setCat(c);
  }, [params]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat !== 'All') list = list.filter((p) => p.category === cat);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.description?.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle)
      );
    }
    const priceOf = (p: Product) => p.sizes[0]?.price ?? p.basePrice;
    switch (sort) {
      case 'low':
        list.sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case 'high':
        list.sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case 'new':
        list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      default:
        list.sort((a, b) => b.rating * b.reviewsCount - a.rating * a.reviewsCount);
    }
    return list;
  }, [products, cat, q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">The bakery shelf</p>
        <h1 className="mt-3 font-display text-5xl font-black text-cocoa md:text-6xl">
          Shop fresh <span className="italic text-raspberry">bakes</span>
        </h1>
      </Reveal>

      {/* search + sort */}
      <Reveal delay={0.1} className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cakes, cupcakes, brownies…"
            className="w-full rounded-full border-2 border-cocoa/10 bg-white py-3.5 pl-12 pr-5 text-sm text-cocoa placeholder:text-cocoa/40 focus:border-raspberry focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-widest text-cocoa/60">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border-2 border-cocoa/10 bg-white px-5 py-3 text-sm font-semibold text-cocoa focus:border-raspberry focus:outline-none"
          >
            <option value="pop">Most loved</option>
            <option value="new">Newest</option>
            <option value="low">Price: low → high</option>
            <option value="high">Price: high → low</option>
          </select>
        </div>
      </Reveal>

      {/* category pills */}
      <Reveal delay={0.15} className="mt-6 flex flex-wrap gap-2.5">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              cat === c
                ? 'bg-cocoa text-cream shadow-lg'
                : 'bg-white text-cocoa/70 ring-1 ring-cocoa/15 hover:bg-pinkSoft hover:text-cocoa'
            }`}
          >
            {c}
          </button>
        ))}
      </Reveal>

      {/* grid */}
      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-[1.75rem] bg-creamDark" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-6xl">🍰</p>
          <p className="mt-4 font-display text-2xl font-semibold text-cocoa">No treats found</p>
          <p className="mt-2 text-cocoa/60">Try a different search or category.</p>
        </div>
      ) : (
        <Stagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {filtered.map((p) => (
            <StaggerItem key={String(p.id)}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-24 text-center text-cocoa/60">Loading treats…</div>}>
      <ShopInner />
    </Suspense>
  );
}
