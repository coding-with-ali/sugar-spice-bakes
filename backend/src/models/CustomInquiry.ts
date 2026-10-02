import mongoose, { Schema, Document } from 'mongoose';

export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';

export const INQUIRY_STATUSES: InquiryStatus[] = [
  'new',
  'contacted',
  'quoted',
  'confirmed',
  'completed',
  'cancelled',
];

export interface ICustomInquiry extends Document {
  createdAt: Date;
  updatedAt: Date;
  occasion: string;
  servings: string;
  size: string;
  flavor: string;
  design: string;
  deliveryDate: Date;
  name: string;
  phone: string;
  city: string;
  email?: string;
  status: InquiryStatus;
  notes?: string;
}

const customInquirySchema = new Schema<ICustomInquiry>(
  {
    occasion: { type: String, required: true },
    servings: { type: String, required: true },
    size: { type: String, default: '' },
    flavor: { type: String, required: true },
    design: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    email: { type: String },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: 'new',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const CustomInquiry = mongoose.model<ICustomInquiry>('CustomInquiry', customInquirySchema);
