import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Bonitaa Salon Manager' },
  role: { type: String, default: 'admin' },
  salonName: { type: String, default: 'Bonitaa Salon & Spa' },
  branch: { type: String, default: 'Theni Branch' },
  phone: { type: String, default: '+91 98765 43210' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
