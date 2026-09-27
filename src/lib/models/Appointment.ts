import mongoose, { Schema, Document } from 'mongoose';
import { IAppointment } from '@/types';

export interface IAppointmentDocument extends Omit<IAppointment, '_id'>, Document {}

const AppointmentSchema: Schema = new Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceName: { type: String, required: true },
  stylistName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Appointment || mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
