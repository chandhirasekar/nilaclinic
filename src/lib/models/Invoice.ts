import mongoose, { Schema, Document } from 'mongoose';
import { IInvoice } from '@/types';

export interface IInvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const InvoiceItemSchema: Schema = new Schema({
  type: { type: String, enum: ['service', 'product', 'package', 'package_use'], default: 'service' },
  itemId: { type: String },
  name: { type: String, required: true },
  staffId: { type: String },
  staffName: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  total: { type: Number, required: true },
  packageId: { type: String },
  packageServiceName: { type: String },
  isFromPackage: { type: Boolean, default: false },
}, { _id: false });

const PaymentSplitSchema: Schema = new Schema({
  mode: { type: String, required: true }, // Cash, Card, UPI, NEFT
  amount: { type: Number, required: true },
  type: { type: String, enum: ['cash', 'non-cash'], default: 'non-cash' },
}, { _id: false });

const InvoiceSchema: Schema = new Schema({
  invoiceNo: { type: String, required: true, unique: true, index: true }, // e.g. NILA-TH-1001
  storeId: { type: String, required: true, index: true },
  customerId: { type: String, index: true },
  customerName: { type: String, required: true },
  customerMobile: { type: String },
  customerPhone: { type: String },
  date: { type: String, required: true },
  items: { type: [InvoiceItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  rowDiscountTotal: { type: Number, default: 0 },
  billDiscountType: { type: String, enum: ['value', 'percent'] },
  billDiscountValue: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  tipAmount: { type: Number, default: 0 },
  tipStaffName: { type: String, default: '' },
  payableAmount: { type: Number, default: 0 },
  payments: { type: [PaymentSplitSchema], default: [] },
  paidAmount: { type: Number, default: 0 },
  changeAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Cancelled'], default: 'Paid', index: true },
  cancellationReason: { type: String },
  staffId: { type: String },
  staffName: { type: String, default: 'Staff' },
  visitId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

// ESR Compound Indexes for high-speed POS billing queries and analytics
InvoiceSchema.index({ storeId: 1, createdAt: -1 });
InvoiceSchema.index({ storeId: 1, status: 1, createdAt: -1 });
InvoiceSchema.index({ storeId: 1, date: -1 });
InvoiceSchema.index({ customerId: 1, createdAt: -1 });
InvoiceSchema.index({ customerMobile: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);
