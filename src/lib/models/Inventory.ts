import mongoose, { Schema, Document } from 'mongoose';
import { IInventory } from '@/types';

export interface IInventoryDocument extends Omit<IInventory, '_id'>, Document {}

const InventorySchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Hair Care' },
  stockQty: { type: Number, required: true, default: 0 },
  minThreshold: { type: Number, default: 5 },
  unitPrice: { type: Number, required: true },
  supplier: { type: String, default: 'L\'Oréal Professional' },
});

export default mongoose.models.Inventory || mongoose.model<IInventoryDocument>('Inventory', InventorySchema);
