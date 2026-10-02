import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  createdAt: Date;
  updatedAt: Date;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  usageLimit: number;
  usedCount: number;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
