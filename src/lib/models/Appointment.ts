import mongoose, { Schema, Document } from 'mongoose';
import { IAppointment } from '@/types';

export interface IAppointmentDocument extends Omit<IAppointment, '_id'>, Document {}

const AppointmentSchema: Schema = new Schema({
  appointmentId: { type: String, unique: true, sparse: true },
  customerId: { type: String, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceName: { type: String, required: true },
  serviceId: { type: String },
  staffName: { type: String },
  staffId: { type: String },
  stylistName: { type: String }, // compatibility alias
  doctorId: { type: String, index: true },
  doctorName: { type: String },
  storeId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  startTime: { type: String, required: true },
  time: { type: String }, // compatibility alias
  durationMins: { type: Number, default: 15 },
  status: {
    type: String,
    enum: ['Booked', 'Arrived', 'In consultation', 'Completed', 'Cancelled', 'No-show', 'Scheduled', 'Confirmed', 'In Progress'],
    default: 'Booked',
    index: true,
  },
  cancelReason: { type: String },
  notes: { type: String },
  amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Appointment || mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
