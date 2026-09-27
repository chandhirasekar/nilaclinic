import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Inventory from '@/lib/models/Inventory';
import { IInventory } from '@/types';

const initialInventory: IInventory[] = [
  { _id: 'i1', name: 'L\'Oréal Mythic Oil (100ml)', category: 'Hair Serum', stockQty: 18, minThreshold: 5, unitPrice: 1250, supplier: 'L\'Oréal India' },
  { _id: 'i2', name: 'Schwarzkopf Keratin Mask (500g)', category: 'Hair Care', stockQty: 3, minThreshold: 6, unitPrice: 2400, supplier: 'Schwarzkopf Professional' },
  { _id: 'i3', name: 'O3+ Facial Glow Serum Pack', category: 'Skin Care', stockQty: 12, minThreshold: 4, unitPrice: 3800, supplier: 'O3 Beauty' },
  { _id: 'i4', name: 'OPI Gel Color Polish (Red)', category: 'Nail Care', stockQty: 8, minThreshold: 3, unitPrice: 950, supplier: 'OPI International' },
  { _id: 'i5', name: 'Matrix Opti.Care Shampoo (1000ml)', category: 'Hair Care', stockQty: 25, minThreshold: 10, unitPrice: 1650, supplier: 'Matrix Salon Dist.' },
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const items = await Inventory.find();
      if (items.length > 0) return NextResponse.json({ success: true, data: items });
    }
    return NextResponse.json({ success: true, data: initialInventory });
  } catch (err) {
    return NextResponse.json({ success: true, data: initialInventory });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    if (db) {
      const newItem = await Inventory.create(body);
      return NextResponse.json({ success: true, data: newItem });
    }
    const newItem: IInventory = { _id: 'i' + Date.now(), ...body };
    initialInventory.push(newItem);
    return NextResponse.json({ success: true, data: newItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
