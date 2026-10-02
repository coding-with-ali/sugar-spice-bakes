import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from './db';
import { config } from './config';
import { User } from './models/User';
import { Product } from './models/Product';
import { Order } from './models/Order';
import { Coupon } from './models/Coupon';
import { Newsletter } from './models/Newsletter';
import { CustomInquiry } from './models/CustomInquiry';
import { slugify } from './utils';

interface SeedSize {
  label: string;
  price: number;
}

interface SeedProduct {
  name: string;
  category: string;
  sizes: SeedSize[];
  old?: number;
  image: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  badges?: string[];
  featured?: boolean;
  bestseller?: boolean;
  desc: string;
}

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Belgian Chocolate Truffle Cake',
    category: 'Cakes',
    sizes: [
      { label: '1 lb', price: 2200 },
      { label: '2 lb', price: 4200 },
    ],
    image: 'chocolate-truffle.jpg',
    stock: 20,
    rating: 4.9,
    reviewsCount: 120,
    badges: ['Bestseller', 'Freshly Baked'],
    featured: true,
    bestseller: true,
    desc: 'Our signature cake — rich Belgian chocolate sponge layered with silky truffle ganache. Baked fresh every morning in our Karachi kitchen.',
  },
  {
    name: 'Classic Red Velvet Cake',
    category: 'Cakes',
    sizes: [
      { label: '1 lb', price: 2000 },
      { label: '2 lb', price: 3800 },
    ],
    image: 'red-velvet.jpg',
    stock: 18,
    rating: 4.8,
    reviewsCount: 86,
    badges: ['Bestseller'],
    featured: true,
    desc: 'Velvety cocoa crumb with our famous cream-cheese frosting. A timeless favourite for birthdays and celebrations.',
  },
  {
    name: 'Pineapple Cream Cake',
    category: 'Cakes',
    sizes: [
      { label: '1 lb', price: 1800 },
      { label: '2 lb', price: 3400 },
    ],
    image: 'pineapple-cream.jpg',
    stock: 15,
    rating: 4.6,
    reviewsCount: 64,
    desc: 'Light vanilla sponge soaked with pineapple, finished with fluffy whipped cream and glazed fruit. Sweet nostalgia in every slice.',
  },
  {
    name: 'Black Forest Cake',
    category: 'Cakes',
    sizes: [
      { label: '1 lb', price: 1900 },
      { label: '2 lb', price: 3600 },
    ],
    image: 'black-forest.jpg',
    stock: 16,
    rating: 4.7,
    reviewsCount: 72,
    badges: ['Freshly Baked'],
    desc: 'Classic chocolate-cherry layers with chantilly cream and chocolate shavings. The old-school celebration cake, done right.',
  },
  {
    name: 'Vanilla Sprinkle Celebration Cake',
    category: 'Cakes',
    sizes: [
      { label: '1 lb', price: 1700 },
      { label: '2 lb', price: 3200 },
    ],
    image: 'vanilla-sprinkle.jpg',
    stock: 14,
    rating: 4.5,
    reviewsCount: 41,
    desc: 'Fluffy vanilla sponge with buttercream and a shower of rainbow sprinkles. Simple, joyful, and kid-approved.',
  },
  {
    name: 'Assorted Cupcakes — Box of 6',
    category: 'Cupcakes',
    sizes: [{ label: 'Box of 6', price: 1500 }],
    image: 'cupcakes-box.jpg',
    stock: 30,
    rating: 4.8,
    reviewsCount: 93,
    badges: ['Bestseller'],
    bestseller: true,
    desc: 'Six pillowy cupcakes in chocolate, vanilla, red velvet and coffee — each crowned with swirled buttercream. Perfect for gifting.',
  },
  {
    name: 'Fudge Brownies — Box of 8',
    category: 'Brownies & Bars',
    sizes: [{ label: 'Box of 8', price: 1200 }],
    image: 'fudge-brownies.jpg',
    stock: 40,
    rating: 4.9,
    reviewsCount: 110,
    badges: ['Bestseller', 'Freshly Baked'],
    featured: true,
    bestseller: true,
    desc: 'Dense, gooey-centred fudge brownies with a crackly top. Warm them for ten seconds and thank us later.',
  },
  {
    name: 'New York Cheesecake',
    category: 'Cheesecakes',
    sizes: [{ label: 'Whole 9"', price: 2800 }],
    image: 'ny-cheesecake.jpg',
    stock: 12,
    rating: 4.7,
    reviewsCount: 58,
    desc: 'Slow-baked cream-cheese cheesecake on a buttery biscuit base — smooth, tangy, and unapologetically rich.',
  },
  {
    name: 'French Macarons — Box of 12',
    category: 'Pastries',
    sizes: [{ label: 'Box of 12', price: 1600 }],
    image: 'macarons.jpg',
    stock: 24,
    rating: 4.6,
    reviewsCount: 47,
    desc: 'Twelve delicate almond macarons in pistachio, raspberry, chocolate, vanilla and salted caramel. Crisp shell, chewy centre.',
  },
  {
    name: 'Butter Croissants — Box of 4',
    category: 'Pastries',
    sizes: [{ label: 'Box of 4', price: 900 }],
    image: 'butter-croissants.jpg',
    stock: 35,
    rating: 4.5,
    reviewsCount: 38,
    desc: 'Laminated over three days for shattering, honeycomb layers. The closest thing to a Paris morning in Karachi.',
  },
  {
    name: 'Custom Fondant Birthday Cake',
    category: 'Custom Cakes',
    sizes: [
      { label: '1.5 lb', price: 3500 },
      { label: '2.5 lb', price: 5500 },
    ],
    image: 'fondant-birthday.jpg',
    stock: 10,
    rating: 5.0,
    reviewsCount: 66,
    badges: ['Bestseller'],
    featured: true,
    bestseller: true,
    desc: 'Your design, our craft — bespoke fondant cakes with any theme, colours and message you dream up. Order at least 3 days ahead.',
  },
  {
    name: 'Tres Leches Milk Cake',
    category: 'Cakes',
    sizes: [
      { label: '1 lb', price: 2100 },
      { label: '2 lb', price: 4000 },
    ],
    image: 'tres-leches.jpg',
    stock: 14,
    rating: 4.8,
    reviewsCount: 52,
    badges: ['Freshly Baked'],
    desc: 'Featherlight sponge soaked in three milks, topped with cinnamon cream. Impossibly moist — serve chilled.',
  },
];

/** Generate a random 16-character password (used only when ADMIN_PASSWORD env is missing). */
function generatePassword(): string {
  return crypto.randomBytes(12).toString('base64url').slice(0, 16);
}

export async function seedDatabase(): Promise<void> {
  // Idempotent: skip if data already exists (never wipe a real database)
  const [userCount, productCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
  ]);
  if (userCount > 0 || productCount > 0) {
    console.log('⏭️  Database already has data — skipping seed (idempotent)');
    return;
  }

  // Seed 2 sample custom-cake inquiries (status 'new') so the admin panel shows data in dev
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  const nineDaysFromNow = new Date();
  nineDaysFromNow.setDate(nineDaysFromNow.getDate() + 9);
  await CustomInquiry.create([
    {
      occasion: 'Birthday',
      servings: '15-20 servings',
      size: '2 lb',
      flavor: 'Chocolate Fudge',
      design:
        'Pink and gold princess theme for a 7-year-old, with a fondant crown and the name "Ayesha" written on top.',
      deliveryDate: fiveDaysFromNow,
      name: 'Fatima Khan',
      phone: '03001234567',
      city: 'Karachi',
      email: 'fatima.k@example.com',
      status: 'new',
    },
    {
      occasion: 'Nikaah',
      servings: '30-40 servings',
      size: '3 lb',
      flavor: 'Vanilla Pistachio',
      design:
        'Elegant ivory and sage-green two-tier cake with fresh flowers and gold accents to match the stage decor.',
      deliveryDate: nineDaysFromNow,
      name: 'Ayesha Siddiqui',
      phone: '03219876543',
      city: 'Karachi',
      status: 'new',
    },
  ]);
  console.log('🎂 2 sample custom-cake inquiries created');

  // Admin user — password comes from ADMIN_PASSWORD env; generate one if missing
  let adminPassword = config.adminPassword;
  let generated = false;
  if (!adminPassword) {
    adminPassword = generatePassword();
    generated = true;
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: 'Sugar & Spice Admin',
    email: config.adminEmail.toLowerCase(),
    phone: '',
    passwordHash,
    isAdmin: true,
  });
  console.log(`👤 Admin user created: ${config.adminEmail}`);
  if (generated) {
    console.log(
      `\n🔑 ADMIN PASSWORD (generated — shown ONCE, save it now): ${adminPassword}\n`
    );
  }

  // Coupons
  await Coupon.create([
    { code: 'SWEET10', type: 'percent', value: 10, minOrder: 0, usageLimit: 0 },
    { code: 'BAKE500', type: 'fixed', value: 500, minOrder: 3000, usageLimit: 100 },
    { code: 'FLAT15', type: 'percent', value: 15, minOrder: 5000, usageLimit: 50 },
  ]);
  console.log('🎟️  Coupons created: SWEET10, BAKE500, FLAT15');

  // Products
  const docs = PRODUCTS.map((p) => {
    const image = `/images/${p.image}`;
    return {
      name: p.name,
      slug: slugify(p.name),
      category: p.category,
      description: p.desc,
      images: [image],
      sizes: p.sizes,
      basePrice: p.sizes[0].price,
      oldPrice: p.old,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      badges: p.badges || [],
      inStock: true,
      stock: p.stock,
      featured: !!p.featured,
      bestseller: !!p.bestseller,
    };
  });
  await Product.insertMany(docs);
  console.log(`🍰 ${docs.length} products created`);

  console.log('✅ Seed complete');
}

async function main() {
  await connectDB();
  await seedDatabase();
  process.exit(0);
}

// Only run when executed directly (npm run seed), not when imported
if (require.main === module) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
