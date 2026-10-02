import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { connectDB } from './db';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import couponRoutes from './routes/coupons';
import orderRoutes from './routes/orders';
import newsletterRoutes from './routes/newsletter';
import customInquiryRoutes from './routes/customInquiries';
import adminRoutes from './routes/admin';

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads served at /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'sugar-spice-api' }));

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes); // GET /api/products, /api/categories, /api/admin/products
app.use('/api', couponRoutes); // POST /api/coupons/validate, /api/admin/coupons
app.use('/api', orderRoutes); // POST /api/orders, /api/orders/track, /api/orders/mine, /api/admin/orders
app.use('/api', newsletterRoutes); // POST /api/newsletter
app.use('/api', customInquiryRoutes); // POST /api/custom-inquiries, /api/admin/inquiries
app.use('/api/admin', adminRoutes); // GET /api/admin/stats

// 404 for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

async function main() {
  await connectDB();
  // In-memory dev DB is fresh on every boot — auto-seed so `npm run dev` just works.
  if (!config.mongoUri) {
    const { User } = await import('./models/User');
    const { seedDatabase } = await import('./seed');
    if ((await User.countDocuments()) === 0) {
      console.log('🌱 Empty dev database — seeding demo data…');
      await seedDatabase();
    }
  }
  app.listen(config.port, () => {
    console.log(`🍰 Sugar & Spice API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
