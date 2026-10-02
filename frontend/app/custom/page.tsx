'use client';

import Image from 'next/image';
import { useState } from 'react';
import { api, imgSrc } from '@/lib/api';
import { useToast } from '@/lib/store-context';
import { SplitWords, Reveal, Stagger, StaggerItem, Marquee } from '@/components/motion';
import { Sticker, WaveDivider } from '@/components/decor';
import {
  PK_CITIES,
  validateName,
  validatePhone,
  normalizePhone,
  validateEmail,
  validateCity,
  validateDeliveryDate,
} from '@/lib/validation';
import { minDeliveryDate } from '@/lib/api';

const OCCASIONS = [
  { name: 'Birthday', emoji: '🎂' },
  { name: 'Wedding', emoji: '💍' },
  { name: 'Nikaah', emoji: '🌙' },
  { name: 'Engagement', emoji: '💎' },
  { name: 'Bridal Shower', emoji: '👰' },
  { name: 'Baby Shower', emoji: '🍼' },
  { name: 'Anniversary', emoji: '❤️' },
  { name: 'Corporate', emoji: '🏢' },
  { name: 'Other', emoji: '✨' },
];

const SERVINGS = [
  '8–10 servings (1 lb)',
  '15–20 servings (2 lb)',
  '25–30 servings (3 lb)',
  '40+ servings (4 lb & up)',
  'Multi-tier (weddings & big events)',
];

const FLAVORS = [
  'Belgian Chocolate Truffle',
  'Classic Red Velvet',
  'Pineapple Cream',
  'Vanilla Bean',
  'Butterscotch Crunch',
  'Coffee Mocha',
  'Lemon Drizzle',
  'Surprise me!',
];

const GALLERY = [
  { src: '/images/fondant-birthday.jpg', label: 'Blush fondant birthday cake' },
  { src: '/images/chocolate-truffle.jpg', label: 'Chocolate truffle celebration' },
  { src: '/images/red-velvet.jpg', label: 'Red velvet showpiece' },
  { src: '/images/vanilla-sprinkle.jpg', label: 'Pastel sprinkle party cake' },
  { src: '/images/black-forest.jpg', label: 'Black forest classic' },
  { src: '/images/tres-leches.jpg', label: 'Tres leches delight' },
];

const STEPS = [
  { n: '01', t: 'Tell us your vision', d: 'Fill the form below — occasion, servings, flavour, and every dreamy detail of your design.' },
  { n: '02', t: 'We sketch & quote', d: 'Within 24 hours our baker calls you back with a design sketch and a fixed quote. No hidden charges.' },
  { n: '03', t: 'We bake & deliver', d: 'Hand-crafted in our Karachi kitchen and delivered fresh on your big day. Picture-perfect, guaranteed.' },
];

interface FormState {
  occasion: string;
  servings: string;
  flavor: string;
  design: string;
  deliveryDate: string;
  name: string;
  phone: string;
  email: string;
  city: string;
}

const EMPTY: FormState = {
  occasion: '',
  servings: '',
  flavor: '',
  design: '',
  deliveryDate: '',
  name: '',
  phone: '',
  email: '',
  city: '',
};

export default function CustomCakesPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: keyof FormState) => setTouched((t) => ({ ...t, [k]: true }));

  const errors: Record<keyof FormState, string | null> = {
    occasion: !form.occasion ? 'Please pick an occasion.' : null,
    servings: !form.servings ? 'Please choose servings / size.' : null,
    flavor: !form.flavor ? 'Please pick a flavour.' : null,
    design:
      form.design.trim().length < 10
        ? 'Tell us a little more about your dream design (min 10 characters).'
        : null,
    deliveryDate: validateDeliveryDate(form.deliveryDate),
    name: validateName(form.name),
    phone: validatePhone(form.phone),
    email: validateEmail(form.email),
    city: validateCity(form.city),
  };

  const show = (k: keyof FormState) => (touched[k] ? errors[k] : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const all = Object.keys(form) as (keyof FormState)[];
    setTouched(Object.fromEntries(all.map((k) => [k, true])));
    if (all.some((k) => errors[k])) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api('/api/custom-inquiries', {
        method: 'POST',
        body: JSON.stringify({
          occasion: form.occasion,
          servings: form.servings,
          flavor: form.flavor,
          design: form.design.trim(),
          deliveryDate: form.deliveryDate,
          name: form.name.trim(),
          phone: normalizePhone(form.phone),
          email: form.email.trim() || undefined,
          city: form.city,
        }),
      });
      setDone(true);
      toast('Inquiry sent! We will call you back within 24 hours.', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Could not send inquiry.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = (bad: string | null) =>
    `w-full rounded-2xl border-2 bg-white px-5 py-3.5 text-sm text-cocoa placeholder:text-cocoa/35 focus:outline-none ${
      bad ? 'border-raspberry' : 'border-cocoa/12 focus:border-raspberry'
    }`;

  return (
    <>
      {/* hero */}
      <section className="sprinkles relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 text-center md:px-8 md:pt-20">
          <Reveal>
            <Sticker color="butter" rotate={-4}>✨ Made-to-order magic</Sticker>
          </Reveal>
          <SplitWords
            as="h1"
            text="Your dream cake, designed by you."
            delay={0.15}
            className="mx-auto mt-6 block max-w-4xl font-display text-5xl font-black leading-[1.02] text-cocoa md:text-7xl"
          />
          <Reveal delay={0.5}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-cocoa/70">
              Wedding tiers, themed birthdays, nikaah elegance — tell us your vision and our
              bakers will sketch it, bake it, and deliver it fresh across Karachi.
            </p>
          </Reveal>
          <Reveal delay={0.65} className="mt-8">
            <a
              href="#order-form"
              className="btn-shimmer inline-block rounded-full bg-raspberry px-10 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-xl transition-transform hover:scale-105"
            >
              Order custom cake ↓
            </a>
          </Reveal>
        </div>
        <div className="relative border-y-4 border-cocoa bg-cocoa py-3">
          <Marquee>
            {['Wedding Tiers', 'Themed Birthdays', 'Nikaah Cakes', 'Baby Showers', 'Bridal Showers', 'Corporate Events'].map((m) => (
              <span key={m} className="mx-6 whitespace-nowrap text-sm font-black uppercase tracking-[0.24em] text-cream">
                {m} <span className="ml-6 text-caramel">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <Stagger className="grid gap-6 md:grid-cols-3" gap={0.12}>
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="h-full rounded-[2rem] bg-white p-8 ring-1 ring-cocoa/10 transition-transform hover:-translate-y-2">
                <p className="font-display text-5xl font-black text-pinkSoft" style={{ WebkitTextStroke: '1.5px #B23A5E' }}>
                  {s.n}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold text-cocoa">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cocoa/65">{s.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* gallery strip */}
      <section className="bg-creamDark/60 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-raspberry">Past creations</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-cocoa md:text-5xl">
              Cakes we&apos;ve <span className="italic text-raspberry">dreamed up</span>
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="mt-10">
          <div className="flex gap-5 overflow-x-auto px-4 pb-4 md:justify-center md:px-8">
            {GALLERY.map((g, i) => (
              <figure
                key={g.src}
                className={`w-56 shrink-0 overflow-hidden rounded-[1.75rem] bg-white shadow-lg ring-1 ring-cocoa/10 ${
                  i % 2 === 1 ? 'md:translate-y-6' : ''
                }`}
              >
                <div className="relative aspect-[3/3.6]">
                  <Image src={imgSrc(g.src)} alt={g.label} fill className="object-cover" />
                </div>
                <figcaption className="px-4 py-3 text-center text-xs font-semibold text-cocoa/70">
                  {g.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      {/* inquiry form */}
      <div id="order-form" className="bg-cocoa">
        <WaveDivider fill="#F7EBDC" flip className="bg-cocoa" />
      </div>
      <section className="bg-cocoa py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-caramel">Design your cake</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-cream md:text-5xl">
              Tell us everything <span className="italic text-caramel">sweet</span>
            </h2>
            <p className="mt-3 text-cream/60">We reply with a sketch & quote within 24 hours.</p>
          </Reveal>

          {done ? (
            <Reveal className="mt-10 rounded-[2rem] bg-cream p-10 text-center">
              <p className="text-6xl">🎂</p>
              <h3 className="mt-4 font-display text-3xl font-bold text-cocoa">Inquiry received!</h3>
              <p className="mx-auto mt-3 max-w-md text-cocoa/70">
                Thank you, {form.name.split(' ')[0] || 'sweet friend'}! Our baker will call you on{' '}
                <strong>{normalizePhone(form.phone)}</strong> within 24 hours with your design sketch & quote.
              </p>
              <button
                onClick={() => {
                  setForm(EMPTY);
                  setTouched({});
                  setDone(false);
                }}
                className="mt-6 rounded-full bg-cocoa px-8 py-3 text-sm font-bold uppercase tracking-widest text-cream"
              >
                Plan another cake
              </button>
            </Reveal>
          ) : (
            <Reveal delay={0.1}>
              <form onSubmit={submit} noValidate className="mt-10 rounded-[2rem] bg-cream p-6 shadow-2xl md:p-10">
                {/* occasion picker */}
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">What&apos;s the occasion? *</p>
                <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                  {OCCASIONS.map((o) => (
                    <button
                      type="button"
                      key={o.name}
                      onClick={() => {
                        set('occasion', o.name);
                        blur('occasion');
                      }}
                      className={`rounded-2xl border-2 px-2 py-3 text-center transition-all ${
                        form.occasion === o.name
                          ? 'border-raspberry bg-pinkSoft shadow-md'
                          : 'border-cocoa/10 bg-white hover:border-cocoa/30'
                      }`}
                    >
                      <span className="block text-2xl">{o.emoji}</span>
                      <span className="mt-1 block text-[11px] font-bold text-cocoa">{o.name}</span>
                    </button>
                  ))}
                </div>
                {show('occasion') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('occasion')}</p>}

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Servings / size *</label>
                    <select value={form.servings} onChange={(e) => set('servings', e.target.value)} onBlur={() => blur('servings')} className={`mt-2 ${inputCls(show('servings'))}`}>
                      <option value="">How many mouths?</option>
                      {SERVINGS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {show('servings') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('servings')}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Flavour *</label>
                    <select value={form.flavor} onChange={(e) => set('flavor', e.target.value)} onBlur={() => blur('flavor')} className={`mt-2 ${inputCls(show('flavor'))}`}>
                      <option value="">Pick a flavour</option>
                      {FLAVORS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {show('flavor') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('flavor')}</p>}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">
                    Describe your dream design *
                  </label>
                  <textarea
                    value={form.design}
                    onChange={(e) => set('design', e.target.value)}
                    onBlur={() => blur('design')}
                    rows={4}
                    placeholder="Colours, theme, toppers, name & age on the cake, reference ideas… the more detail, the better!"
                    className={`mt-2 ${inputCls(show('design'))}`}
                  />
                  {show('design') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('design')}</p>}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Delivery date *</label>
                    <input
                      type="date"
                      value={form.deliveryDate}
                      min={minDeliveryDate()}
                      onChange={(e) => set('deliveryDate', e.target.value)}
                      onBlur={() => blur('deliveryDate')}
                      className={`mt-2 ${inputCls(show('deliveryDate'))}`}
                    />
                    {show('deliveryDate') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('deliveryDate')}</p>}
                    <p className="mt-1.5 text-xs text-cocoa/50">Custom cakes need at least 48 hours notice.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">City *</label>
                    <select value={form.city} onChange={(e) => set('city', e.target.value)} onBlur={() => blur('city')} className={`mt-2 ${inputCls(show('city'))}`}>
                      <option value="">Select city</option>
                      {PK_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {show('city') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('city')}</p>}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Your name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      onBlur={() => blur('name')}
                      placeholder="Full name"
                      className={`mt-2 ${inputCls(show('name'))}`}
                    />
                    {show('name') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('name')}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Mobile *</label>
                    <input
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                      onBlur={() => blur('phone')}
                      placeholder="03001234567"
                      inputMode="numeric"
                      className={`mt-2 ${inputCls(show('phone'))}`}
                    />
                    {show('phone') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('phone')}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-[0.24em] text-cocoa/60">Email <span className="normal-case tracking-normal">(optional)</span></label>
                    <input
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      onBlur={() => blur('email')}
                      placeholder="you@example.com"
                      className={`mt-2 ${inputCls(show('email'))}`}
                    />
                    {show('email') && <p className="mt-1.5 text-xs font-semibold text-raspberry">{show('email')}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-shimmer mt-8 w-full rounded-full bg-raspberry py-4.5 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-transform hover:scale-[1.01] disabled:opacity-60"
                >
                  {busy ? 'Sending…' : '🎂 Send my cake inquiry'}
                </button>
                <p className="mt-3 text-center text-xs text-cocoa/50">
                  Free consultation · No advance needed to inquire
                </p>
              </form>
            </Reveal>
          )}
        </div>
      </section>
      <div className="bg-cream">
        <WaveDivider fill="#3B2417" className="bg-cream" />
      </div>
    </>
  );
}
