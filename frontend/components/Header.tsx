'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart, useWishlist, useAuth } from '@/lib/store-context';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/track', label: 'Track Order' },
];

export default function Header() {
  const { count, setOpen } = useCart();
  const { slugs } = useWishlist();
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hideOnAdmin = pathname?.startsWith('/admin');

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/90 shadow-[0_8px_30px_rgba(59,36,23,0.10)] backdrop-blur-xl' : 'bg-cream'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-raspberry text-xl shadow-md transition-transform duration-300 group-hover:rotate-12">
            🧁
          </span>
          <span className="leading-none">
            <span className="block font-display text-[22px] font-bold text-cocoa">
              Sugar <span className="text-raspberry">&</span> Spice
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.42em] text-caramel">
              Bakes
            </span>
          </span>
        </Link>

        {/* desktop nav */}
        {!hideOnAdmin && (
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
                  pathname === n.href ? 'text-raspberry' : 'text-cocoa/70 hover:text-cocoa'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/custom"
              className="rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-cream transition-transform hover:scale-105"
            >
              🎂 Design Your Cake
            </Link>
          </nav>
        )}

        {/* icons */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-pinkSoft"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#3B2417" strokeWidth="1.9">
              <path d="M12 21s-7.5-4.7-10-9.3C.4 8.6 2.4 5 5.8 5c2 0 3.4 1.1 4.2 2.3h4c.8-1.2 2.2-2.3 4.2-2.3 3.4 0 5.4 3.6 3.8 6.7C19.5 16.3 12 21 12 21z" transform="scale(0.92) translate(1,0)" />
            </svg>
            {slugs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-raspberry px-1 text-[10px] font-bold text-white">
                {slugs.length}
              </span>
            )}
          </Link>
          <Link
            href={user ? '/account' : '/account'}
            aria-label="Account"
            className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-pinkSoft"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#3B2417" strokeWidth="1.9">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
            </svg>
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open cart"
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-pinkSoft"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#3B2417" strokeWidth="1.9">
              <path d="M6 7h15l-1.7 8.5a2 2 0 0 1-2 1.5H8.7a2 2 0 0 1-2-1.6L4.5 4.8A1 1 0 0 0 3.5 4H2" />
              <circle cx="9.5" cy="20.5" r="1.4" />
              <circle cx="17" cy="20.5" r="1.4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-caramel px-1 text-[10px] font-bold text-cocoa">
                {count}
              </span>
            )}
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-full md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="#3B2417" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && !hideOnAdmin && (
        <nav className="border-t border-cocoa/10 bg-cream px-6 py-4 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-cocoa/80"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/custom"
            onClick={() => setMenuOpen(false)}
            className="mt-2 inline-block rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-cream"
          >
            🎂 Design Your Cake
          </Link>
        </nav>
      )}
    </header>
  );
}
