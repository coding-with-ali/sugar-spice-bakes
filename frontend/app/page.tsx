'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, normProducts, imgSrc, formatPKR } from '@/lib/api';
import type { Product } from '@/lib/types';
import { SplitWords, Reveal, Stagger, StaggerItem, Marquee, Parallax, Magnetic } from '@/components/motion';
import { Sticker, Starburst, WaveDivider, SectionHead } from '@/components/decor';
import ProductCard from '@/components/ProductCard';
import Stars from '@/components/Stars';

const CATEGORY_TILES = [
  { name: 'Cakes', emoji: '🎂', blurb: 'Celebration classics' },
  { name: 'Cupcakes', emoji: '🧁', blurb: 'Little joys, boxed' },
  { name: 'Brownies & Bars', emoji: '🍫', blurb: 'Fudgy & intense' },
  { name: 'Cheesecakes', emoji: '🍰', blurb: 'Silky New York style' },
  { name: 'Pastries', emoji: '🥐', blurb: 'Flaky French treats' },
  { name: 'Custom Cakes', emoji: '✨', blurb: 'Your design, our oven' },
];

const TESTIMONIALS = [
  {
    name: 'Areeba K.',
    area: 'DHA, Karachi',
    text: 'The red velvet cake was the softest I have ever had — my daughter’s birthday felt straight out of a magazine. Delivery was right on time!',
    product: 'Classic Red Velvet Cake',
  },
  {
    name: 'Danish R.',
    area: 'Gulshan, Karachi',
    text: 'Ordered a custom fondant cake with my wife’s name on top. The detailing was unreal and the taste? Even better. Worth every rupee.',
    product: 'Custom Fondant Birthday Cake',
  },
  {
    name: 'Mahnoor S.',
    area: 'Clifton, Karachi',
    text: 'Tres leches is my obsession and theirs is dangerously good — milky, light, not too sweet. I reorder every single month.',
    product: 'Tres Leches Milk Cake',
  },
];

const MARQUEE_ITEMS = [
  'Freshly Baked Daily',
  'Custom Celebration Cakes',
  'Eggless Options Available',
  'Karachi-Wide Delivery',
  'Baked with Love',
  '100% Halal Ingredients',
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);

  useEffect(() => {
    api<unknown>('/api/products?featured=true')
      .then((d) => setFeatured(normProducts(d).slice(0, 4)))
      .catch(() => {});
    api<unknown>('/api/products?bestseller=true')
      .then((d) => setBestsellers(normProducts(d).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="sprinkles relative overflow-hidden">
        <Parallax className="pointer-events-none absolute inset-0" speed={0.18}>
          <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-pinkSoft blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-butter/40 blur-3xl" />
        </Parallax>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:px-8 md:pb-24 md:pt-16">
          <div>
            <Reveal>
              <Sticker color="butter" rotate={-5}>🧁 Freshly baked daily</Sticker>
            </Reveal>
            <SplitWords
              as="h1"
              text="Life is short. Eat the cake."
              delay={0.15}
              className="mt-6 block font-display text-5xl font-black leading-[1.02] text-cocoa md:text-7xl"
            />
            <Reveal delay={0.5}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-cocoa/70">
                Karachi&apos;s cosiest home bakery — celebration cakes, cupcakes, brownies & fully
                custom bakes, made fresh to order and delivered to your doorstep.
              </p>
            </Reveal>
            <Reveal delay={0.65} className="mt-8 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link
                  href="/shop"
                  className="btn-shimmer inline-block rounded-full bg-raspberry px-9 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-xl transition-transform hover:scale-105"
                >
                  Shop fresh bakes
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/custom"
                  className="inline-block rounded-full border-2 border-cocoa px-9 py-[14px] text-sm font-bold uppercase tracking-[0.18em] text-cocoa transition-colors hover:bg-cocoa hover:text-cream"
                >
                  Design a custom cake
                </Link>
              </Magnetic>
            </Reveal>
            <Reveal delay={0.8} className="mt-10 flex items-center gap-8">
              <div>
                <p className="font-display text-3xl font-bold text-cocoa">4.9★</p>
                <p className="text-xs uppercase tracking-widest text-cocoa/60">2,400+ happy reviews</p>
              </div>
              <div className="h-10 w-px bg-cocoa/15" />
              <div>
                <p className="font-display text-3xl font-bold text-cocoa">48 hrs</p>
                <p className="text-xs uppercase tracking-widest text-cocoa/60">custom cake notice</p>
              </div>
              <div className="h-10 w-px bg-cocoa/15" />
              <div>
                <p className="font-display text-3xl font-bold text-cocoa">100%</p>
                <p className="text-xs uppercase tracking-widest text-cocoa/60">halal ingredients</p>
              </div>
            </Reveal>
          </div>

          {/* hero visual */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <Reveal delay={0.3} y={60}>
              <div className="relative overflow-hidden rounded-b-[2.5rem] rounded-t-[999px] shadow-[0_40px_90px_-30px_rgba(59,36,23,0.45)] ring-8 ring-white">
                <div className="animate-slow-zoom relative aspect-[4/5]">
                  <Image
                    src="/images/hero-bakery.jpg"
                    alt="Sugar & Spice Bakes — cozy bakery counter full of cakes"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
            {/* floating doodles */}
            <div className="animate-float absolute -left-6 top-16 md:-left-10" style={{ '--float-rot': '-12deg' } as React.CSSProperties}>
              <Starburst className="h-28 w-28"><>Baked<br />with love</></Starburst>
            </div>
            <div className="animate-float absolute -right-4 bottom-24 md:-right-8" style={{ animationDelay: '1.4s', '--float-rot': '8deg' } as React.CSSProperties}>
              <Sticker color="caramel" rotate={8} className="animate-wiggle text-sm">🍓 100% fresh</Sticker>
            </div>
            <div className="animate-float absolute -bottom-5 left-10 rounded-3xl bg-white px-5 py-4 shadow-xl ring-1 ring-cocoa/10" style={{ animationDelay: '2.2s' }}>
              <div className="flex items-center gap-3">
                <Stars value={5} />
                <p className="text-xs font-semibold text-cocoa/70">“Best cake in Karachi!”</p>
              </div>
            </div>
          </div>
        </div>

        {/* marquee ribbon */}
        <div className="relative -rotate-1 border-y-4 border-cocoa bg-raspberry py-3.5">
          <Marquee>
            {MARQUEE_ITEMS.map((m) => (
              <span key={m} className="mx-6 flex items-center gap-6 whitespace-nowrap text-sm font-black uppercase tracking-[0.24em] text-white">
                {m} <span className="text-butter">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ========================= SHOP BY CATEGORY ========================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHead
          eyebrow="Pick your craving"
          title={<>Shop by <span className="italic text-raspberry">craving</span></>}
          sub="From everyday cupcakes to showstopper celebration cakes — every bite is baked fresh the morning it ships."
          center
        />
        <Stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6" gap={0.07}>
          {CATEGORY_TILES.map((c) => (
            <StaggerItem key={c.name}>
              <Link
                href={`/shop?cat=${encodeURIComponent(c.name)}`}
                className="group block rounded-[1.75rem] bg-white p-6 text-center ring-1 ring-cocoa/10 transition-all hover:-translate-y-2 hover:bg-pinkSoft hover:shadow-xl"
              >
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-creamDark text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {c.emoji}
                </span>
                <p className="mt-4 font-display text-lg font-bold text-cocoa">{c.name}</p>
                <p className="mt-1 text-xs text-cocoa/60">{c.blurb}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============================ FEATURED ============================= */}
      <section className="bg-creamDark/60 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="This week's stars"
              title={<>Fresh out of <span className="italic text-raspberry">the oven</span></>}
            />
            <Reveal delay={0.2}>
              <Link href="/shop" className="group text-sm font-bold uppercase tracking-[0.2em] text-cocoa">
                View all treats <span className="inline-block transition-transform group-hover:translate-x-1.5">→</span>
              </Link>
            </Reveal>
          </div>
          <Stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
            {featured.map((p) => (
              <StaggerItem key={String(p.id)}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
          {featured.length === 0 && (
            <p className="mt-8 text-center text-cocoa/50">Fresh bakes are on their way — check back soon!</p>
          )}
        </div>
      </section>

      {/* ======================= DARK LUXE BESTSELLERS ====================== */}
      <div className="bg-cocoa">
        <WaveDivider fill="#F7EBDC" flip className="bg-cocoa" />
      </div>
      <section className="bg-cocoa py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            dark
            eyebrow="Customer obsessions"
            title={<>The most <span className="italic text-caramel">coveted</span> bakes</>}
            sub="The cakes Karachi keeps reordering — rich, indulgent, and unapologetically decadent."
          />
          <Stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
            {bestsellers.map((p) => (
              <StaggerItem key={String(p.id)}>
                <ProductCard product={p} dark />
              </StaggerItem>
            ))}
          </Stagger>
          {bestsellers.length === 0 && (
            <p className="mt-8 text-center text-cream/50">Bestsellers are being frosted — check back soon!</p>
          )}
        </div>
      </section>
      <div className="bg-cream">
        <WaveDivider fill="#3B2417" className="bg-cream" />
      </div>

      {/* ============================ CRAFT / STORY ========================= */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <Reveal className="relative">
          <div className="overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-30px_rgba(59,36,23,0.4)] ring-8 ring-white">
            <div className="relative aspect-[4/4.6]">
              <Image src="/images/baker-craft.jpg" alt="Baker piping a cake at Sugar & Spice Bakes" fill className="object-cover" />
            </div>
          </div>
          <div className="animate-float absolute -right-4 top-8 md:-right-8">
            <Sticker color="raspberry" rotate={6}>👩‍🍳 Home-baked</Sticker>
          </div>
        </Reveal>
        <div>
          <SectionHead
            eyebrow="Our craft"
            title={<>Small-batch, <span className="italic text-raspberry">big love</span></>}
            sub="We are a home bakery, not a factory. Every cake is mixed, baked, and decorated by hand in our Karachi kitchen — the morning of your celebration."
          />
          <Stagger className="mt-8 space-y-4" gap={0.1}>
            {[
              { t: 'Baked to order', d: 'Nothing sits in a freezer. Your cake goes in the oven for you.' },
              { t: 'Real ingredients', d: 'Belgian chocolate, French butter, farm eggs — no shortcuts.' },
              { t: 'Custom everything', d: 'Flavours, messages, toppers, themes — if you can dream it, we pipe it.' },
            ].map((f) => (
              <StaggerItem key={f.t}>
                <div className="flex gap-4 rounded-3xl bg-white p-5 ring-1 ring-cocoa/10">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pinkSoft text-xl">✓</span>
                  <div>
                    <p className="font-display text-lg font-bold text-cocoa">{f.t}</p>
                    <p className="mt-1 text-sm text-cocoa/65">{f.d}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* =========================== TESTIMONIALS =========================== */}
      <section className="bg-pinkSoft/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            eyebrow="Sweet words"
            title={<>Loved across <span className="italic text-raspberry">Karachi</span></>}
            center
          />
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3" gap={0.1}>
            {TESTIMONIALS.map((t, i) => (
              <StaggerItem key={t.name}>
                <figure
                  className={`h-full rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(59,36,23,0.35)] ring-1 ring-cocoa/10 ${
                    i === 1 ? 'md:-rotate-2' : i === 0 ? 'md:rotate-1' : 'md:rotate-2'
                  }`}
                >
                  <Stars value={5} size={16} />
                  <blockquote className="mt-4 font-display text-lg leading-relaxed text-cocoa">
                    “{t.text}”
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="font-bold text-cocoa">{t.name}</p>
                    <p className="text-xs uppercase tracking-widest text-cocoa/50">{t.area}</p>
                    <p className="mt-2 inline-block rounded-full bg-creamDark px-3 py-1 text-xs font-semibold text-caramelDark">
                      ordered: {t.product}
                    </p>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============================ CUSTOM CTA ============================ */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <div className="sprinkles relative overflow-hidden rounded-[2.5rem] bg-raspberry px-6 py-16 text-center shadow-2xl md:py-20">
            <div className="animate-float absolute left-8 top-8 text-4xl" style={{ '--float-rot': '-10deg' } as React.CSSProperties}>🎂</div>
            <div className="animate-float absolute bottom-8 right-8 text-4xl" style={{ animationDelay: '1.2s', '--float-rot': '10deg' } as React.CSSProperties}>🧁</div>
            <Sticker color="butter" rotate={-3} className="mb-6">✨ Made-to-order magic</Sticker>
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-black leading-tight text-white md:text-6xl">
              Dreaming of a one-of-a-kind cake?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Wedding tiers, birthday themes, baby showers — tell us your vision and our bakers will sketch, bake & deliver it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Magnetic>
                <Link
                  href="/custom"
                  className="btn-shimmer inline-block rounded-full bg-white px-9 py-4 text-sm font-bold uppercase tracking-[0.18em] text-raspberry shadow-xl transition-transform hover:scale-105"
                >
                  Start your custom cake
                </Link>
              </Magnetic>
              <span className="inline-flex items-center rounded-full border-2 border-white/60 px-6 py-3 text-sm font-semibold text-white">
                From {formatPKR(3500)}
              </span>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
