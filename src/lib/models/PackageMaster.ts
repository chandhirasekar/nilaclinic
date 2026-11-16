import mongoose, { Schema, Document } from 'mongoose';
import { IPackageMaster } from '@/types';

export interface IPackageMasterDocument extends Omit<IPackageMaster, '_id'>, Document {}

const PackageServiceItemSchema = new Schema({
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  count: { type: Number, required: true, default: 1 },
  valuePerSitting: { type: Number, default: 0 },
}, { _id: false });

const PackageProductItemSchema = new Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantityPerSitting: { type: Number, required: true, default: 1 },
}, { _id: false });

const PackageMasterSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Fixed', 'On-demand'], default: 'Fixed' },
  services: [PackageServiceItemSchema],
  products: [PackageProductItemSchema],
  totalSittings: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  valuePerSitting: { type: Number, required: true, default: 0 },
  validityDays: { type: Number, required: true, default: 180 },
  availableStores: { type: [String], default: ['ALL'] },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.models.PackageMaster || mongoose.model<IPackageMasterDocument>('PackageMaster', PackageMasterSchema);

