'use client';

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ---------------------------------- Reveal --------------------------------- */
/** Fade-and-rise when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------- Stagger -------------------------------- */
const containerV: Variants = {
  hidden: {},
  show: (gap: number = 0.09) => ({
    transition: { staggerChildren: gap, delayChildren: 0.05 },
  }),
};

const itemV: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

export function Stagger({
  children,
  className,
  gap = 0.09,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      custom={gap}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemV}>
      {children}
    </motion.div>
  );
}

/* -------------------------------- SplitWords ------------------------------- */
/** Headline reveal: each word rises out of an overflow mask, staggered. */
export function SplitWords({
  text,
  className,
  delay = 0,
  wordDelay = 0.055,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
  delay?: number;
  wordDelay?: number;
  as?: 'span' | 'h1' | 'h2' | 'p';
}) {
  const words = text.split(' ');
  const reduce = useReducedMotion();
  const MTag = motion[Tag];
  return (
    <MTag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: reduce ? 0 : '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.9, delay: delay + i * wordDelay, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </MTag>
  );
}

/* --------------------------------- Marquee --------------------------------- */
/** Infinite scrolling ribbon. Duplicate children are rendered for a seamless loop. */
export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`group relative flex overflow-hidden ${className ?? ''}`}>
      <div className="animate-marquee flex shrink-0 items-center group-hover:[animation-play-state:paused]">
        {children}
      </div>
      <div aria-hidden className="animate-marquee flex shrink-0 items-center group-hover:[animation-play-state:paused]">
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- Parallax -------------------------------- */
export function Parallax({
  children,
  className,
  speed = 0.25,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------- MagneticWrap ------------------------------ */
/** Subtle magnetic pull toward the cursor for premium buttons. */
export function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0px, 0px)';
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block transition-transform duration-300 ease-out"
    >
      {children}
    </div>
  );
}

/* --------------------------------- Counter --------------------------------- */
export { motion, AnimatePresence };
