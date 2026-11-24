import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const services = await clinicService.getServices(storeCode);
    return NextResponse.json({ success: true, data: services });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const service = await clinicService.createService(body);
    return NextResponse.json({ success: true, data: service });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || body._id;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Treatment ID is required' }, { status: 400 });
    }
    const updated = await clinicService.updateService(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Treatment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Treatment updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
