import mongoose, { Schema, Document } from 'mongoose';
import { IInvoice } from '@/types';

export interface IInvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const InvoiceSchema: Schema = new Schema({
  invoiceNo: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card'], default: 'Cash' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invoice || mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);
