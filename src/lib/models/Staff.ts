import mongoose, { Schema, Document } from 'mongoose';
import { IStaff } from '@/types';

export interface IStaffDocument extends Omit<IStaff, '_id'>, Document {}

const StaffSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Senior Stylist' },
  phone: { type: String, default: '' },
  commissionRate: { type: Number, default: 10 },
  status: { type: String, enum: ['Available', 'On Break', 'Busy', 'Off Duty'], default: 'Available' },
  revenueGenerated: { type: Number, default: 0 },
});

export default mongoose.models.Staff || mongoose.model<IStaffDocument>('Staff', StaffSchema);
