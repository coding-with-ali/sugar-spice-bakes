import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  isAdmin: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
