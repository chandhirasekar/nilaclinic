import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const search = searchParams.get('search') || undefined;
    const mobile = searchParams.get('mobile') || undefined;

    if (mobile) {
      // FR-20 & FR-21: Search by mobile number with dropdown matches
      const matches = await clinicService.searchCustomerByMobile(mobile);
      return NextResponse.json({ success: true, data: matches });
    }

    const customers = await clinicService.getCustomers(storeCode, search);
    return NextResponse.json({ success: true, data: customers });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, phone, gender, dob, email, area, allergyNotes, skinHairNotes, firstStoreId } = body;

    const targetMobile = mobile || phone;
    if (!name || !targetMobile) {
      return NextResponse.json({
        success: false,
        message: 'Customer name and mobile number are required'
      }, { status: 400 });
    }

    // FR-23: Duplicate check (same mobile + same name is blocked)
    const isDuplicate = await clinicService.checkDuplicateCustomer(name, targetMobile);
    if (isDuplicate) {
      return NextResponse.json({
        success: false,
        isDuplicate: true,
        message: `A client named "${name}" with mobile ${targetMobile} already exists.`
      }, { status: 409 });
    }

    const newCustomer = await clinicService.createCustomer({
      name,
      mobile: targetMobile,
      gender: gender || 'Female',
      dob,
      email,
      area,
      allergyNotes,
      skinHairNotes,
      firstStoreId: firstStoreId || 'NILA-TH',
    });

    return NextResponse.json({ success: true, data: newCustomer });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
