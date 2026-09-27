import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '@/types';

export interface IServiceDocument extends Omit<IService, '_id'>, Document {}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
});

export default mongoose.models.Service || mongoose.model<IServiceDocument>('Service', ServiceSchema);
