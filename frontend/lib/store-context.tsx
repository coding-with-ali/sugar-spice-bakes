'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from './api';
import type { CartItem, User } from './types';

/* ---------------- toast ---------------- */

interface ToastMsg {
  id: number;
  text: string;
  kind: 'success' | 'error' | 'info';
}

const ToastCtx = createContext<{ toast: (text: string, kind?: ToastMsg['kind']) => void }>({
  toast: () => {},
});
export const useToast = () => useContext(ToastCtx);

/* ---------------- auth ---------------- */

interface AuthState {
  user: User | null;
  authToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within Providers');
  return ctx;
};

/* ---------------- cart ---------------- */

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  updateQty: (index: number, qty: number) => void;
  removeAt: (index: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CartCtx = createContext<CartState | null>(null);
export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart must be used within Providers');
  return ctx;
};

/* ---------------- wishlist ---------------- */

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
}

const WishCtx = createContext<WishlistState | null>(null);
export const useWishlist = () => {
  const ctx = useContext(WishCtx);
  if (!ctx) throw new Error('useWishlist must be used within Providers');
  return ctx;
};

/* ---------------- provider ---------------- */

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

let toastId = 0;

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishSlugs, setWishSlugs] = useState<string[]>([]);
  const booted = useRef(false);

  const toast = useCallback((text: string, kind: ToastMsg['kind'] = 'info') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, text, kind }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((m) => m.id !== id));
    }, 3400);
  }, []);

  // boot from localStorage
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    setCartItems(readLS<CartItem[]>('ssb_cart', []));
    setWishSlugs(readLS<string[]>('ssb_wishlist', []));
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('ssb_token') : null;
    if (saved) {
      api<{ user: User | null }>('/api/auth/me')
        .then((d) => {
          if (!d.user) throw new Error('No user');
          setUser(d.user);
          setAuthToken(saved);
        })
        .catch(() => {
          window.localStorage.removeItem('ssb_token');
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (booted.current) {
      try {
        window.localStorage.setItem('ssb_cart', JSON.stringify(cartItems));
      } catch {}
    }
  }, [cartItems]);

  useEffect(() => {
    if (booted.current) {
      try {
        window.localStorage.setItem('ssb_wishlist', JSON.stringify(wishSlugs));
      } catch {}
    }
  }, [wishSlugs]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    window.localStorage.setItem('ssb_token', data.token);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const data = await api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    window.localStorage.setItem('ssb_token', data.token);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('ssb_token');
    setAuthToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const d = await api<{ user: User | null }>('/api/auth/me');
    if (d.user) setUser(d.user);
  }, []);

  const add = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.id === item.id &&
          p.size === item.size &&
          (p.cakeMessage || '') === (item.cakeMessage || '')
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((index: number, qty: number) => {
    setCartItems((prev) =>
      qty <= 0 ? prev.filter((_, i) => i !== index) : prev.map((p, i) => (i === index ? { ...p, qty } : p))
    );
  }, []);

  const removeAt = useCallback((index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setCartItems([]), []);

  const toggle = useCallback((slug: string) => {
    setWishSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const has = useCallback((slug: string) => wishSlugs.includes(slug), [wishSlugs]);

  const clearWish = useCallback(() => setWishSlugs([]), []);

  const cart = useMemo<CartState>(() => {
    const count = cartItems.reduce((a, i) => a + i.qty, 0);
    const subtotal = cartItems.reduce((a, i) => a + i.qty * i.price, 0);
    return {
      items: cartItems,
      count,
      subtotal,
      add,
      updateQty,
      removeAt,
      clear,
      open: cartOpen,
      setOpen: setCartOpen,
    };
  }, [cartItems, cartOpen, add, updateQty, removeAt, clear]);

  const auth = useMemo<AuthState>(
    () => ({ user, authToken, loading: authLoading, login, register, logout, refresh }),
    [user, authToken, authLoading, login, register, logout, refresh]
  );

  const wish = useMemo<WishlistState>(
    () => ({ slugs: wishSlugs, toggle, has, clear: clearWish }),
    [wishSlugs, toggle, has, clearWish]
  );

  return (
    <ToastCtx.Provider value={{ toast }}>
      <AuthCtx.Provider value={auth}>
        <CartCtx.Provider value={cart}>
          <WishCtx.Provider value={wish}>
            {children}
            {/* toasts */}
            <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  className={`pointer-events-auto w-full rounded-2xl px-4 py-3 text-sm font-medium shadow-xl ${
                    t.kind === 'success'
                      ? 'bg-cocoa text-cream'
                      : t.kind === 'error'
                        ? 'bg-raspberry text-white'
                        : 'bg-caramel text-cocoa'
                  }`}
                >
                  {t.text}
                </div>
              ))}
            </div>
          </WishCtx.Provider>
        </CartCtx.Provider>
      </AuthCtx.Provider>
    </ToastCtx.Provider>
  );
}
