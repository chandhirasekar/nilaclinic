import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const products = await clinicService.getProducts(storeCode);
    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, message: 'Product name and price are required' }, { status: 400 });
    }
    const product = await clinicService.createProduct(body);
    return NextResponse.json({ success: true, data: product });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || body._id;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ success: false, message: 'Product name and price are required' }, { status: 400 });
    }
    const updated = await clinicService.updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Product updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

