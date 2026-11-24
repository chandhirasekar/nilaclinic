import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '@/types';

export interface IServiceDocument extends Omit<IService, '_id'>, Document {}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, default: 30 }, // in minutes
  price: { type: Number, required: true },
  gstPercent: { type: Number, default: 18 },
  availableStores: { type: [String], default: ['ALL'] },
  storeWisePrices: { type: Map, of: Number, default: {} },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);
