import mongoose, { Schema, Document } from 'mongoose';
import { IVisit } from '@/types';

export interface IVisitDocument extends Omit<IVisit, '_id'>, Document {}

const VisitSchema: Schema = new Schema({
  visitId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  storeId: { type: String, required: true, index: true },
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  status: { type: String, enum: ['Waiting', 'In consultation', 'Done'], default: 'Waiting', index: true },
  caseNotes: { type: String },
  prescriptionText: { type: String },
  prescriptionImage: { type: String },
  isReadByDoctor: { type: Boolean, default: false },
  billId: { type: String },
  createdAt: { type: Date, default: Date.now },
  consultedAt: { type: Date },
});

export default mongoose.models.Visit || mongoose.model<IVisitDocument>('Visit', VisitSchema);

