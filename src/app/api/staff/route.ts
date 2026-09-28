import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Staff from '@/lib/models/Staff';
import { IStaff } from '@/types';

const initialStaff: IStaff[] = [
  { _id: 'st1', name: 'Anitha R.', role: 'Senior Hair & Skin Specialist', phone: '+91 98401 22334', commissionRate: 15, status: 'Busy', revenueGenerated: 42500 },
  { _id: 'st2', name: 'Kavitha M.', role: 'Trichologist & Hair Therapy Expert', phone: '+91 97890 33445', commissionRate: 12, status: 'Available', revenueGenerated: 38900 },
  { _id: 'st3', name: 'Rajesh V.', role: 'Senior Dermatologist & Specialist', phone: '+91 98940 55667', commissionRate: 10, status: 'Available', revenueGenerated: 29400 },
  { _id: 'st4', name: 'Sujatha P.', role: 'Laser & Aesthetic Care Specialist', phone: '+91 94441 77889', commissionRate: 10, status: 'Available', revenueGenerated: 21500 },
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const staff = await Staff.find();
      if (staff.length > 0) return NextResponse.json({ success: true, data: staff });
    }
    return NextResponse.json({ success: true, data: initialStaff });
  } catch (err) {
    return NextResponse.json({ success: true, data: initialStaff });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    if (db) {
      const newStaff = await Staff.create(body);
      return NextResponse.json({ success: true, data: newStaff });
    }
    const newStaff: IStaff = { _id: 'st' + Date.now(), status: 'Available', revenueGenerated: 0, ...body };
    initialStaff.push(newStaff);
    return NextResponse.json({ success: true, data: newStaff });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
