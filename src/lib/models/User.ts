import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'doctor'], default: 'admin' },
  phone: { type: String, default: '+91 98765 43210' },
  assignedStoreIds: { type: [String], default: [] },
  primaryStoreId: { type: String },
  isActive: { type: Boolean, default: true },
  specialization: { type: String },
  salonName: { type: String, default: 'Nila Clinic - Skin & Hair Care' },
  branch: { type: String, default: 'Theni Branch' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
