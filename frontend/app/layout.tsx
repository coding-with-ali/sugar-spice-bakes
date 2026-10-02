import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/store-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const display = Fraunces({
  variable: '--font-ssb-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
});

const sans = Inter({
  variable: '--font-ssb-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Sugar & Spice Bakes — Fresh Cakes, Cupcakes & Custom Bakes in Karachi',
  description:
    'Karachi’s home bakery for celebration cakes, cupcakes, brownies, cheesecakes & custom bakes — baked fresh to order and delivered with love.',
  openGraph: {
    title: 'Sugar & Spice Bakes — Baked Fresh, Delivered with Love',
    description:
      'Celebration cakes, cupcakes, brownies, cheesecakes & custom bakes — made fresh to order in Karachi.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-cocoa">
        <Providers>
          <div className="bg-raspberry px-4 py-2 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white">
              🍰 Fresh from the oven daily <span className="mx-2 opacity-60">·</span> Free delivery over PKR 5,000
            </p>
          </div>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
