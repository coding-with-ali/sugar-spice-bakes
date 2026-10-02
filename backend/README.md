# Sugar & Spice Bakes — Backend API

Karachi home-bakery ecommerce API. Node.js + Express 5 + TypeScript + Mongoose. Runs on port 5000.

## Setup

```bash
npm install
cp .env.example .env   # then edit values
```

## Scripts

| Script      | Command                  |
| ----------- | ------------------------ |
| `npm run dev`   | Start dev server (tsx, hot reload). Empty in-memory DB auto-seeds |
| `npm run build` | Compile to `dist/`      |
| `npm start`     | Run compiled server      |
| `npm run seed`  | Seed DB (admin user, coupons, 12 bakery products, 2 sample inquiries). Idempotent — skips if data exists |

## Environment

| Var | Default | Notes |
| --- | ------- | ----- |
| `PORT` | 5000 | API port |
| `MONGODB_URI` | _(empty)_ | Empty = in-memory MongoDB for dev; set to a real URI for prod |
| `JWT_SECRET` | _(empty)_ | Required in prod (Render generates one). Dev falls back to a temporary in-memory secret |
| `FRONTEND_URL` | http://localhost:3000 | Allowed CORS origin |
| `ADMIN_EMAIL` | admin@sugarspice.pk | Seeded admin login |
| `ADMIN_PASSWORD` | _(empty)_ | Set a strong password BEFORE seeding in prod. If empty at seed time, a random 16-char password is generated and printed to the console ONCE |

## API

**Public**
- `GET /api/health` — health check
- `GET /api/categories` — product categories
- `GET /api/products?category=&featured=1&bestseller=1&q=` — product list
- `GET /api/products/:slug` — product detail + related
- `POST /api/orders` — guest checkout (strict validation: name ≥3 letters, PK mobile `03XXXXXXXXX`, address ≥10 chars, city required, optional email/postal format checks, `paymentMethod` `cod|bank`, `deliveryDate` ≥ tomorrow, sizes validated against DB, coupon validated server-side). Returns `{ order_number: "SSB-XXXXXX", ... }`
- `GET /api/orders/track/:orderNumber?phone=` — returns 403 unless the full phone matches
- `GET /api/orders/mine` — auth: logged-in user's orders
- `POST /api/coupons/validate { code, subtotal }`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin/login`, `GET /api/auth/me`
- `POST /api/custom-inquiries` — custom cake quote request (strict validation, same style as checkout). Returns 201
- `POST /api/newsletter`

**Admin** (`Authorization: Bearer <token>` where token's user `isAdmin`):
- `GET /api/admin/stats` — revenue, orders/products/customers counts, low stock, recent orders, 14-day revenue, status breakdown, `inquiryCount` (new) + `recentInquiries`
- `GET /api/admin/inquiries?status=` · `PATCH /api/admin/inquiries/:id` (`{status, notes}`)
- `GET /api/admin/stats` — revenue, orders/products/customers counts, low stock, recent orders, 14-day revenue, status breakdown
- `GET /api/admin/orders?status=` · `GET /api/admin/orders/:id` · `PATCH /api/admin/orders/:id` (status pipeline: `pending → baking → out_for_delivery → delivered`, or `cancelled`)
- `GET/POST/PUT/DELETE /api/admin/products` (image upload via multipart `images`, sizes as JSON or `label:price` CSV)
- `GET/POST/PUT/DELETE /api/admin/coupons`

Uploads: `multer` → `public/uploads`, served at `/uploads` (5MB, images only).
Error shape: `{ "error": "message" }`.

## Deploy (Render, free)

1. Push this folder's repo to GitHub.
2. In Render → New → Web Service → `render.yaml` blueprint.
3. Set `MONGODB_URI` (Atlas), `ADMIN_PASSWORD` (strong), `FRONTEND_URL` in the dashboard.
4. After first deploy, run the seed once (Render Shell: `npm run seed`) to create the admin user, coupons and products.
5. Cold starts on the free tier take ~30–60s after idle — first page load can be slow.
