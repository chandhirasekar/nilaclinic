import mongoose, { Schema, Document } from 'mongoose';
import { IStore } from '@/types';

export interface IStoreDocument extends Omit<IStore, '_id'>, Document {}

const StoreSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g. NILA-TH
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  gstin: { type: String, default: '33ABCDE1234F1Z5' },
  workingHours: {
    open: { type: String, default: '09:00 AM' },
    close: { type: String, default: '08:00 PM' },
    weeklyOff: { type: String, default: 'None' },
  },
  invoicePrefix: { type: String },
  nextInvoiceNumber: { type: Number, default: 1001 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Store || mongoose.model<IStoreDocument>('Store', StoreSchema);
