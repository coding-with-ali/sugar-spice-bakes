import mongoose, { Schema, Document } from 'mongoose';

export const PRODUCT_CATEGORIES = [
  'Cakes',
  'Cupcakes',
  'Brownies & Bars',
  'Cheesecakes',
  'Pastries',
  'Custom Cakes',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface ISizeOption {
  label: string;
  price: number;
}

export interface IProduct extends Document {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  category: string;
  description: string;
  images: string[];
  sizes: ISizeOption[];
  basePrice: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  badges: string[];
  inStock: boolean;
  stock: number;
  featured: boolean;
  bestseller: boolean;
}

const sizeOptionSchema = new Schema<ISizeOption>(
  {
    label: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true, enum: [...PRODUCT_CATEGORIES] },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    sizes: { type: [sizeOptionSchema], default: [] },
    basePrice: { type: Number, required: true },
    oldPrice: { type: Number },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
