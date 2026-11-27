import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let staff = await clinicService.getStaff(storeCode);
    if (activeOnly) {
      staff = staff.filter((s) => s.isActive !== false);
    }
    return NextResponse.json({ success: true, data: staff });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.mobile) {
      return NextResponse.json({ success: false, message: 'Name and mobile number are required' }, { status: 400 });
    }

    const newStaff = await clinicService.createStaff(body);
    return NextResponse.json({ success: true, data: newStaff });
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
      return NextResponse.json({ success: false, message: 'Staff ID is required' }, { status: 400 });
    }

    const updated = await clinicService.updateStaff(targetId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Staff ID is required' }, { status: 400 });
    }

    await clinicService.deleteStaff(id);
    return NextResponse.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

