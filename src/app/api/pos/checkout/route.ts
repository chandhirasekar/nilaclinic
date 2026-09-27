import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import { IInvoice } from '@/types';

export async function POST(req: Request) {
  try {
    const { customerName, customerPhone, items, subtotal, tax, discount, grandTotal, paymentMethod } = await req.json();

    const invoiceNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const invoiceData: IInvoice = {
      invoiceNo,
      customerName,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    const db = await connectToDatabase();
    if (db) {
      const inv = await Invoice.create(invoiceData);
      return NextResponse.json({ success: true, data: inv });
    }

    return NextResponse.json({ success: true, data: invoiceData });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
