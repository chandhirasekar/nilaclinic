import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from '@/types';

export interface ICustomerDocument extends Omit<ICustomer, '_id'>, Document {}

const CustomerSchema: Schema = new Schema({
  customerId: { type: String, required: true, unique: true, index: true }, // e.g. CID-1001
  patientId: { type: String }, // alias
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, index: true, trim: true }, // +91 ...
  phone: { type: String, trim: true }, // alias
  gender: { type: String, enum: ['Female', 'Male', 'Other'], default: 'Female' },
  age: { type: Number },
  dob: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  area: { type: String, default: '' },
  address: { type: String, default: '' },
  allergyNotes: { type: String, default: '' },
  skinHairNotes: { type: String, default: '' },
  notes: { type: String, default: '' },
  firstStoreId: { type: String, required: true, default: 'NILA-TH' }, // First store where registered
  storeId: { type: String, default: 'NILA-TH' },
  visits: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// ESR Compound Indexes for fast patient search and duplicate validation
CustomerSchema.index({ firstStoreId: 1, createdAt: -1 });
CustomerSchema.index({ firstStoreId: 1, mobile: 1 });
CustomerSchema.index({ mobile: 1, name: 1 });
CustomerSchema.index({ phone: 1, name: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
