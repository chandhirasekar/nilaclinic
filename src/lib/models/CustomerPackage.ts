import mongoose, { Schema, Document } from 'mongoose';
import { ICustomerPackage } from '@/types';

export interface ICustomerPackageDocument extends Omit<ICustomerPackage, '_id'>, Document {}

const ServiceRemainingSchema = new Schema({
  serviceName: { type: String, required: true },
  totalCount: { type: Number, required: true },
  usedCount: { type: Number, required: true, default: 0 },
  remainingCount: { type: Number, required: true },
}, { _id: false });

const AdjustmentHistorySchema = new Schema({
  action: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: String, required: true },
  byUser: { type: String, required: true },
}, { _id: false });

const CustomerPackageSchema: Schema = new Schema({
  customerId: { type: String, required: true, index: true },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  storeSold: { type: String, required: true },
  purchaseInvoiceNo: { type: String, required: true },
  servicesRemaining: [ServiceRemainingSchema],
  totalSittings: { type: Number, required: true },
  usedSittings: { type: Number, required: true, default: 0 },
  remainingSittings: { type: Number, required: true },
  validityExpiryDate: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'Expired'], default: 'Active', index: true },
  adjustmentHistory: [AdjustmentHistorySchema],
}, {
  timestamps: true,
});

export default mongoose.models.CustomerPackage || mongoose.model<ICustomerPackageDocument>('CustomerPackage', CustomerPackageSchema);

