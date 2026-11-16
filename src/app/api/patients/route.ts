import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const search = searchParams.get('search') || undefined;
    const checkPhone = searchParams.get('checkPhone') || undefined;

    if (checkPhone) {
      const duplicate = await clinicService.checkDuplicatePatientPhone(checkPhone, storeCode);
      return NextResponse.json({
        success: true,
        isDuplicate: !!duplicate,
        duplicatePatient: duplicate,
      });
    }

    const patients = await clinicService.getPatients(storeCode, search);
    return NextResponse.json({ success: true, data: patients });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, storeId, gender, age, email, address, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: 'Patient name and mobile number are required' }, { status: 400 });
    }

    // FR-10: Check duplicate mobile number flag
    const existing = await clinicService.checkDuplicatePatientPhone(phone, storeId);

    const newPatient = await clinicService.createPatient({
      name,
      phone,
      storeId: storeId || 'THN',
      gender: gender || 'Female',
      age: age ? Number(age) : undefined,
      email,
      address,
      notes,
    });

    return NextResponse.json({
      success: true,
      data: newPatient,
      isDuplicatePhone: !!existing,
      message: existing ? 'Warning: A patient with this mobile number already exists!' : 'Patient registered successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

