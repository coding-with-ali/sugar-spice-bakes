# Sugar & Spice Bakes — Frontend

Next.js 16 (app router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion 13.

## Run

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev      # http://localhost:3000
npm run build    # production build (must pass)
```

## Structure

```
app/
  page.tsx            home — animated hero, marquee, categories, featured,
                      dark bestsellers, craft story, testimonials, custom CTA
  shop/               category filter, search, sort
  product/[slug]/     gallery, size selector, cake-message field, qty
  custom/             custom-cake inquiry form + design gallery
  cart/               cart page          checkout/  guest checkout + coupons
  track/              order tracking     wishlist/  saved treats
  account/            login/register + order history
  admin/              Bakery HQ — overview, orders, products, inquiries, coupons
components/           Header, Footer, CartDrawer, ProductCard, Stars,
                      motion.tsx (Reveal/Stagger/SplitWords/Marquee/…),
                      decor.tsx (Sticker, Starburst, WaveDivider, SectionHead)
lib/
  theme.ts            ← brand palette tokens (single source of truth)
  api.ts              API client, image resolver, PKR formatting
  validation.ts       Daraz-style PK checkout validation
  store-context.tsx   cart / wishlist / auth / toasts
public/images/        14 generated bakery photos (JPEG)
```

## Theming

Change the palette in **one place**: `lib/theme.ts`, then mirror the hexes in
the `@theme` block of `app/globals.css` (Tailwind v4 tokens: `bg-cream`,
`text-cocoa`, `bg-raspberry`, `text-caramel`, …).
