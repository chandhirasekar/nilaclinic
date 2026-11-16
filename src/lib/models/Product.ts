import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '@/types';

export interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  sku: { type: String, default: '' },
  price: { type: Number, required: true },
  gstPercent: { type: Number, default: 18 },
  availableStores: { type: [String], default: ['ALL'] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

