import mongoose, { Schema, Document } from 'mongoose';
import { IClinicSettings } from '@/types';

export interface IClinicSettingDocument extends Omit<IClinicSettings, '_id'>, Document {}

const ClinicSettingSchema: Schema = new Schema({
  clinicName: { type: String, default: 'Nila Clinic - Skin & Hair Care' },
  logoUrl: { type: String, default: '/logo.png' },
  address: { type: String, default: 'Theni Main Road, Tamil Nadu - 625531' },
  phone: { type: String, default: '+91 98450 11223' },
  email: { type: String, default: 'info@nilaclinic.com' },
  gstin: { type: String, default: '33ABCDE1234F1Z5' },
  billFooter: { type: String, default: 'Thank you for choosing Nila Clinic! We care for your skin and hair.' },
  printSize: { type: String, enum: ['80mm', 'A4'], default: '80mm' },
  gstOnBills: { type: Boolean, default: false }, // default false in BRD v3.0
  maxStaffDiscountPercent: { type: Number, default: 10 },
  staffCanEditPrice: { type: Boolean, default: false },
  backDatedBillingRoles: { type: [String], default: ['admin'] },
  slotInterval: { type: Number, default: 15 },
  packageUseInOtherStores: { type: Boolean, default: true },
  sharingOfCaseNotes: { type: Boolean, default: true },
  staffCanExport: { type: Boolean, default: false },
  endOfDayEmail: {
    enabled: { type: Boolean, default: false },
    recipients: { type: [String], default: ['admin@nilaclinic.com'] },
    sendTime: { type: String, default: '21:30' },
    format: { type: String, enum: ['combined', 'per-store'], default: 'combined' },
    attachExcel: { type: Boolean, default: true },
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.ClinicSetting || mongoose.model<IClinicSettingDocument>('ClinicSetting', ClinicSettingSchema);

