import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code) {
      const store = await clinicService.getStoreByCode(code);
      if (!store) {
        return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: store });
    }

    const stores = await clinicService.getStores();
    return NextResponse.json({ success: true, data: stores });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.code || !body.address || !body.phone) {
      return NextResponse.json({
        success: false,
        message: 'Name, store code, address, and contact phone are required'
      }, { status: 400 });
    }

    const existing = await clinicService.getStoreByCode(body.code);
    if (existing) {
      return NextResponse.json({
        success: false,
        message: `Store code ${body.code.toUpperCase()} already exists`
      }, { status: 400 });
    }

    const store = await clinicService.createStore(body);
    return NextResponse.json({ success: true, data: store });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { code, ...updates } = body;

    if (!code) {
      return NextResponse.json({ success: false, message: 'Store code is required' }, { status: 400 });
    }

    const updated = await clinicService.updateStore(code, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
