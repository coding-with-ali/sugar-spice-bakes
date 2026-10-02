import { Reveal } from './motion';

/** Playful rotated sticker badge, e.g. "Freshly Baked". */
export function Sticker({
  children,
  color = 'raspberry',
  rotate = -6,
  className = '',
}: {
  children: React.ReactNode;
  color?: 'raspberry' | 'caramel' | 'butter' | 'cocoa';
  rotate?: number;
  className?: string;
}) {
  const bg =
    color === 'raspberry'
      ? 'bg-raspberry text-white'
      : color === 'caramel'
        ? 'bg-caramel text-cocoa'
        : color === 'butter'
          ? 'bg-butter text-cocoa'
          : 'bg-cocoa text-cream';
  return (
    <span
      className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] shadow-lg ${bg} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

/** Starburst badge (CSS-only burst) for "Bestseller" etc. */
export function Starburst({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-raspberry" fill="currentColor">
        <path d="M50 0 L58 12 L72 6 L74 20 L88 18 L86 32 L100 36 L92 48 L100 60 L86 64 L88 78 L74 76 L72 90 L58 84 L50 96 L42 84 L28 90 L26 76 L12 78 L14 64 L0 60 L8 48 L0 36 L14 32 L12 18 L26 20 L28 6 L42 12 Z" />
      </svg>
      <span className="relative px-5 py-2 text-center text-[11px] font-black uppercase leading-tight tracking-widest text-white">
        {children}
      </span>
    </div>
  );
}

/** Wavy divider between sections (SVG wave). */
export function WaveDivider({
  fill = '#3B2417',
  flip = false,
  className = '',
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        className="h-[46px] w-full md:h-[64px]"
        style={flip ? { transform: 'scaleY(-1)' } : undefined}
      >
        <path
          d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,45 L1440,70 L0,70 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/** Section eyebrow label + headline, editorial style. */
export function SectionHead({
  eyebrow,
  title,
  sub,
  dark = false,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? 'text-center' : ''}>
      <p
        className={`text-xs font-bold uppercase tracking-[0.32em] ${
          dark ? 'text-caramel' : 'text-raspberry'
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-4xl font-semibold leading-[1.05] md:text-6xl ${
          dark ? 'text-cream' : 'text-cocoa'
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 max-w-xl text-base leading-relaxed ${dark ? 'text-cream/70' : 'text-cocoa/70'} ${center ? 'mx-auto' : ''}`}>
          {sub}
        </p>
      )}
    </Reveal>
  );
}
