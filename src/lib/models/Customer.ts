import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from '@/types';

export interface ICustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const CustomerSchema: Schema = new Schema({
  customerId: { type: String, required: true, unique: true, index: true }, // e.g. CID-1001
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, index: true, trim: true }, // +91 ...
  phone: { type: String, trim: true }, // alias
  gender: { type: String, enum: ['Female', 'Male', 'Other'], default: 'Female' },
  dob: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  area: { type: String, default: '' },
  allergyNotes: { type: String, default: '' },
  skinHairNotes: { type: String, default: '' },
  notes: { type: String, default: '' },
  firstStoreId: { type: String, required: true, default: 'NILA-TH' }, // First store where registered
  visits: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
