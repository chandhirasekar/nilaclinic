import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from '@/types';

export interface ICustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  gender: { type: String, enum: ['Female', 'Male', 'Other'], default: 'Female' },
  visits: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 100 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
