import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const packages = await clinicService.getPackages(storeCode);
    return NextResponse.json({ success: true, data: packages });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, services, products, price, validityDays, availableStores } = body;

    if (!name || !price) {
      return NextResponse.json({ success: false, message: 'Package name and price are required' }, { status: 400 });
    }

    const newPkg = await clinicService.createPackage({
      name,
      type: type || 'Fixed',
      services: services || [],
      products: products || [],
      price: Number(price),
      validityDays: Number(validityDays) || 180,
      availableStores: availableStores || ['ALL'],
      isActive: true,
    });

    return NextResponse.json({ success: true, data: newPkg, message: 'Package created successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, _id, ...updates } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ success: false, message: 'Package ID is required' }, { status: 400 });
    }

    const updated = await clinicService.updatePackage(targetId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Package updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

