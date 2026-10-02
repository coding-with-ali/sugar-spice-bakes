import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  productId?: Types.ObjectId;
  name: string;
  size?: string;
  cakeMessage?: string;
  price: number;
  qty: number;
  image?: string;
}

export interface ITimelineEntry {
  status: string;
  at: Date;
  note?: string;
}

export interface ICustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
  email?: string;
}

export type OrderStatus = 'pending' | 'baking' | 'out_for_delivery' | 'delivered' | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'baking',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export interface IOrder extends Document {
  createdAt: Date;
  updatedAt: Date;
  orderNumber: string;
  user?: Types.ObjectId;
  customer: ICustomer;
  items: IOrderItem[];
  paymentMethod: 'cod' | 'bank';
  deliveryDate: Date;
  subtotal: number;
  discount: number;
  couponCode?: string;
  postal?: string;
  shipping: number;
  total: number;
  status: OrderStatus;
  timeline: ITimelineEntry[];
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    size: { type: String },
    cakeMessage: { type: String },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const timelineSchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true },
    note: { type: String },
  },
  { _id: false }
);

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customer: { type: customerSchema, required: true },
    items: { type: [orderItemSchema], default: [] },
    paymentMethod: { type: String, enum: ['cod', 'bank'], required: true },
    deliveryDate: { type: Date, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    postal: { type: String },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    timeline: { type: [timelineSchema], default: [] },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
