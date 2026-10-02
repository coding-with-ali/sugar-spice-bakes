import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  createdAt: Date;
  updatedAt: Date;
  email: string;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);
