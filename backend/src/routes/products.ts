import { Router, Request, Response, NextFunction } from 'express';
import { Product, PRODUCT_CATEGORIES } from '../models/Product';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { serializeProduct, slugify } from '../utils';

const router = Router();

// ---------- PUBLIC ----------

// GET /api/categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    return res.json([...PRODUCT_CATEGORIES]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load categories' });
  }
});

// GET /api/products?category=&featured=&bestseller=&q=
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { q, category, featured, bestseller } = req.query as Record<string, string>;
    const filter: Record<string, any> = {};

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { category: rx }, { description: rx }];
    }
    if (category) {
      if (!(PRODUCT_CATEGORIES as readonly string[]).includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      filter.category = category;
    }
    if (featured === '1' || featured === 'true') filter.featured = true;
    if (bestseller === '1' || bestseller === 'true') filter.bestseller = true;

    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
    return res.json(products.map(serializeProduct));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load products' });
  }
});

// GET /api/products/:slug
router.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .sort({ createdAt: -1 })
      .limit(4);
    return res.json({
      product: serializeProduct(product),
      related: related.map(serializeProduct),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load product' });
  }
});

// ---------- ADMIN (POST/PUT/DELETE /api/admin/products) ----------
router.use('/admin/products', requireAuth, requireAdmin);
router.use('/admin/upload', requireAuth, requireAdmin);

// POST /api/admin/upload — single image upload, returns { url }
router.post('/admin/upload', (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: 'No image file received' });
    return res.json({ url: `/uploads/${file.filename}` });
  });
});

// Wrap multer so file errors become JSON 400s
function uploadMultiple(field: string, maxCount: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(field, maxCount)(req, res, (err: any) => {
      if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
      next();
    });
  };
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base) || 'product';
  let candidate = slug;
  let n = 2;
  while (
    await Product.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

function csv(value: any): string[] {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function bool1(value: any): boolean {
  return value === '1' || value === 1 || value === true || value === 'true';
}

type SizeOption = { label: string; price: number };

/** Accept sizes as JSON '[{"label":"1 lb","price":1800}]' or CSV '1 lb:1800, 2 lb:3400'. */
function parseSizes(value: any): SizeOption[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((s: any) => ({ label: String(s.label || '').trim(), price: Number(s.price) }))
      .filter((s) => s.label && Number.isFinite(s.price) && s.price >= 0);
  }
  const str = String(value).trim();
  if (str.startsWith('[')) {
    try {
      return parseSizes(JSON.parse(str));
    } catch {
      return [];
    }
  }
  return str
    .split(',')
    .map((part) => {
      const [label, price] = part.split(':').map((p) => p.trim());
      return { label: label || '', price: Number(price) };
    })
    .filter((s) => s.label && Number.isFinite(s.price) && s.price >= 0);
}

/** Accept image URLs as JSON array or comma-separated string. */
function parseImageUrls(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const str = String(value).trim();
  if (str.startsWith('[')) {
    try {
      const arr = JSON.parse(str);
      return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return csv(str);
}

router.post('/admin/products', uploadMultiple('images', 8), async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      description,
      sizes,
      base_price,
      basePrice: basePriceCamel,
      old_price,
      oldPrice: oldPriceCamel,
      badges,
      stock,
      in_stock,
      inStock: inStockCamel,
      featured,
      bestseller,
      image_urls,
      images: imagesCamel,
    } = req.body || {};

    if (!name) return res.status(400).json({ error: 'Product name is required' });
    if (!category || !(PRODUCT_CATEGORIES as readonly string[]).includes(String(category))) {
      return res.status(400).json({ error: `Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}` });
    }

    const parsedSizes = parseSizes(sizes);
    const rawBase = basePriceCamel !== undefined ? basePriceCamel : base_price;
    let basePrice: number | undefined =
      rawBase !== undefined && rawBase !== '' ? Number(rawBase) : undefined;
    if ((basePrice === undefined || !Number.isFinite(basePrice)) && parsedSizes.length > 0) {
      basePrice = parsedSizes[0].price;
    }
    if (basePrice === undefined || !Number.isFinite(basePrice) || basePrice < 0) {
      return res.status(400).json({ error: 'A valid base price is required' });
    }

    const uploaded = (((req as any).files || []) as any[]).map(
      (f) => `/uploads/${f.filename}`
    );
    const images = [...uploaded, ...parseImageUrls(image_urls ?? imagesCamel)];
    const rawOld = oldPriceCamel !== undefined ? oldPriceCamel : old_price;
    const rawStock = stock;
    const rawInStock = inStockCamel !== undefined ? inStockCamel : in_stock;

    const product = await Product.create({
      name: String(name).trim(),
      slug: await uniqueSlug(String(name)),
      category: String(category),
      description: description ? String(description).trim() : '',
      images,
      sizes: parsedSizes,
      basePrice,
      oldPrice: rawOld !== undefined && rawOld !== '' ? Number(rawOld) : undefined,
      badges: csv(badges),
      stock: rawStock !== undefined && rawStock !== '' ? Number(rawStock) : 0,
      inStock: rawInStock === undefined ? true : bool1(rawInStock),
      featured: bool1(featured),
      bestseller: bool1(bestseller),
    });
    return res.json({ ok: true, id: product._id });
  } catch (err: any) {
    if (err?.code === 11000)
      return res.status(400).json({ error: 'A product with this slug already exists' });
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put(
  '/admin/products/:id',
  uploadMultiple('images', 8),
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const body = req.body || {};
      if (body.name !== undefined) {
        product.name = String(body.name).trim();
        product.slug = await uniqueSlug(String(body.name), String(product._id));
      }
      if (body.category !== undefined) {
        if (!(PRODUCT_CATEGORIES as readonly string[]).includes(String(body.category))) {
          return res
            .status(400)
            .json({ error: `Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}` });
        }
        product.category = String(body.category);
      }
      if (body.description !== undefined) product.description = String(body.description).trim();
      if (body.sizes !== undefined) product.sizes = parseSizes(body.sizes);
      if (body.base_price !== undefined && body.base_price !== '')
        product.basePrice = Number(body.base_price);
      if (body.basePrice !== undefined && body.basePrice !== '')
        product.basePrice = Number(body.basePrice);
      if (body.old_price !== undefined)
        product.oldPrice = body.old_price === '' ? undefined : Number(body.old_price);
      if (body.oldPrice !== undefined)
        product.oldPrice = body.oldPrice === '' || body.oldPrice === null ? undefined : Number(body.oldPrice);
      if (body.badges !== undefined) product.badges = csv(body.badges);
      if (body.stock !== undefined && body.stock !== '') product.stock = Number(body.stock);
      if (body.in_stock !== undefined) product.inStock = bool1(body.in_stock);
      if (body.inStock !== undefined) product.inStock = bool1(body.inStock);
      if (body.featured !== undefined) product.featured = bool1(body.featured);
      if (body.bestseller !== undefined) product.bestseller = bool1(body.bestseller);

      const uploaded = (((req as any).files || []) as any[]).map(
        (f) => `/uploads/${f.filename}`
      );
      if (Array.isArray(body.images)) {
        // JSON editors send the complete image list — replace it.
        product.images = [...uploaded, ...parseImageUrls(body.images)];
      } else {
        const extra = parseImageUrls(body.image_urls);
        if (uploaded.length > 0 || extra.length > 0) {
          product.images = [...uploaded, ...extra, ...(product.images || [])];
        }
      }

      await product.save();
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

router.delete('/admin/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/admin/products (admin list)
router.get('/admin/products', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products.map(serializeProduct));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load products' });
  }
});

export default router;
