import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET() {
  try {
    const modes = await clinicService.getPaymentModes();
    return NextResponse.json({ success: true, data: modes });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: 'Payment mode name is required' }, { status: 400 });
    }
    const mode = await clinicService.createPaymentMode(body);
    return NextResponse.json({ success: true, data: mode });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

