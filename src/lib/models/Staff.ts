import mongoose, { Schema, Document } from 'mongoose';
import { IStaff } from '@/types';

export interface IStaffDocument extends Omit<IStaff, '_id'>, Document {}

const StaffSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  email: { type: String },
  designation: {
    type: String,
    enum: ['Doctor', 'Therapist', 'Front desk', 'Customer care', 'Manager'],
    default: 'Therapist',
  },
  stores: { type: [String], default: ['NILA-TH'] },
  workingHours: {
    start: { type: String, default: '09:00 AM' },
    end: { type: String, default: '08:00 PM' },
  },
  calendarColour: { type: String, default: '#0284c7' },
  showInAppointmentCalendar: { type: Boolean, default: true },
  hasLogin: { type: Boolean, default: false },
  loginRole: { type: String, enum: ['Admin', 'Staff', 'Doctor'], default: 'Staff' },
  commissionRate: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'On Break', 'Busy', 'Off Duty'], default: 'Available' },
  revenueGenerated: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Staff || mongoose.model<IStaffDocument>('Staff', StaffSchema);
