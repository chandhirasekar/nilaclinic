import mongoose, { Schema, Document } from 'mongoose';
import { IPatient } from '@/types';

export interface IPatientDocument extends Omit<IPatient, '_id'>, Document {}

const PatientSchema: Schema = new Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  gender: { type: String, enum: ['Female', 'Male', 'Other'], default: 'Female' },
  age: { type: Number },
  address: { type: String },
  storeId: { type: String, required: true, index: true },
  visits: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

PatientSchema.index({ storeId: 1, createdAt: -1 });
PatientSchema.index({ storeId: 1, phone: 1 });

export default mongoose.models.Patient || mongoose.model<IPatientDocument>('Patient', PatientSchema);

