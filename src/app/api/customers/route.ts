import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import { ICustomer } from '@/types';

const initialCustomers: ICustomer[] = [
  { _id: 'c1', name: 'Priya Sharma', phone: '+91 98450 11223', email: 'priya.s@gmail.com', gender: 'Female', visits: 8, totalSpent: 18500, loyaltyPoints: 450, notes: 'Prefers Organic Facial Products' },
  { _id: 'c2', name: 'Deepa Lakshmi', phone: '+91 98765 88990', email: 'deepa.l@gmail.com', gender: 'Female', visits: 4, totalSpent: 9200, loyaltyPoints: 230, notes: 'Keratin treatment history' },
  { _id: 'c3', name: 'Sangeetha Mohan', phone: '+91 94431 55667', email: 'sangeetha.m@yahoo.com', gender: 'Female', visits: 12, totalSpent: 34000, loyaltyPoints: 890, notes: 'VIP Customer - Bridal Booking' },
  { _id: 'c4', name: 'Kavya S.', phone: '+91 99011 22334', email: 'kavya.s@outlook.com', gender: 'Female', visits: 3, totalSpent: 6500, loyaltyPoints: 150, notes: 'Regular Haircut & Highlights' },
  { _id: 'c5', name: 'Meera Nair', phone: '+91 91234 56789', email: 'meera.nair@gmail.com', gender: 'Female', visits: 5, totalSpent: 11000, loyaltyPoints: 310, notes: 'Loves Spa Treatments' },
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const customers = await Customer.find().sort({ createdAt: -1 });
      if (customers.length > 0) return NextResponse.json({ success: true, data: customers });
    }
    return NextResponse.json({ success: true, data: initialCustomers });
  } catch (err) {
    return NextResponse.json({ success: true, data: initialCustomers });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    if (db) {
      const newCust = await Customer.create(body);
      return NextResponse.json({ success: true, data: newCust });
    }
    const newCust: ICustomer = { _id: 'c' + Date.now(), visits: 1, totalSpent: 0, loyaltyPoints: 100, ...body };
    initialCustomers.unshift(newCust);
    return NextResponse.json({ success: true, data: newCust });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
