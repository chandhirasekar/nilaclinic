import mongoose, { Schema, Document } from 'mongoose';
import { IPaymentMode } from '@/types';

export interface IPaymentModeDocument extends Omit<IPaymentMode, '_id'>, Document {}

const PaymentModeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['cash', 'non-cash'], default: 'non-cash' },
  displayOrder: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PaymentMode || mongoose.model<IPaymentModeDocument>('PaymentMode', PaymentModeSchema);

