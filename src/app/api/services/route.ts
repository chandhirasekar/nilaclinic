import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { IService } from '@/types';

const initialServices: IService[] = [
  { _id: 's1', name: 'Hydra Facial & Skin Brightening Therapy', category: 'Skin Care', duration: 60, price: 2499, description: 'Deep cleansing, exfoliation, and hydration skin care' },
  { _id: 's2', name: 'Advanced Keratin Hair Therapy & Restoration', category: 'Hair Care', duration: 90, price: 3200, description: 'Deep hair nourishing & smoothening treatment with keratin' },
  { _id: 's3', name: 'Laser Hair Reduction & Pigmentation Care', category: 'Skin Care', duration: 45, price: 4500, description: 'Clinical laser treatment for permanent smooth skin' },
  { _id: 's4', name: 'Hair Fall Control & Scalp Therapy', category: 'Hair Care', duration: 60, price: 3800, description: 'Specialized scalp rejuvenation & hair growth treatment' },
  { _id: 's5', name: 'Anti-Aging & Collagen Skin Rejuvenation', category: 'Skin Care', duration: 60, price: 2999, description: 'Tightening & youthful skin collagen enhancement' },
  { _id: 's6', name: 'Hair Scalp Detox & Deep Conditioning', category: 'Hair Care', duration: 45, price: 1800, description: 'Scalp cleansing, dandruff relief & hair nourishment' },
  { _id: 's7', name: 'Acne & Scar Removal Clinical Care', category: 'Skin Care', duration: 45, price: 2100, description: 'Dermatological acne treatment & scar smoothing' },
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const services = await Service.find();
      if (services.length > 0) return NextResponse.json({ success: true, data: services });
    }
    return NextResponse.json({ success: true, data: initialServices });
  } catch (err) {
    return NextResponse.json({ success: true, data: initialServices });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    if (db) {
      const newSvc = await Service.create(body);
      return NextResponse.json({ success: true, data: newSvc });
    }
    const newSvc: IService = { _id: 's' + Date.now(), ...body };
    initialServices.push(newSvc);
    return NextResponse.json({ success: true, data: newSvc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
