import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const role = searchParams.get('role') || undefined;

    let users = await clinicService.getUsers(storeCode);
    if (role) {
      users = users.filter(u => u.role === role);
    }

    if (role === 'doctor') {
      // Also include staff registered as Doctor
      const staffList = await clinicService.getStaff(storeCode);
      const docStaff = staffList.filter(s => s.designation === 'Doctor');
      for (const ds of docStaff) {
        const alreadyExists = users.some(u => 
          String(u._id) === String(ds._id) || 
          (ds.email && u.email.toLowerCase() === ds.email.toLowerCase()) ||
          u.name.toLowerCase() === ds.name.toLowerCase()
        );
        if (!alreadyExists) {
          users.push({
            _id: String(ds._id),
            name: ds.name,
            email: ds.email || `doctor.${ds.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@nilaclinic.com`,
            role: 'doctor',
            phone: ds.mobile,
            assignedStoreIds: ds.stores || (storeCode ? [storeCode] : ['NILA-TH']),
            primaryStoreId: ds.stores?.[0] || storeCode || 'NILA-TH',
            isActive: ds.isActive !== false,
            specialization: 'Consulting Doctor',
          } as any);
        }
      }
    }

    // Do not leak raw passwords
    const safeUsers = users.map(({ password, ...rest }) => ({
      ...rest,
      _id: String(rest._id),
    }));
    return NextResponse.json({ success: true, data: safeUsers });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role, assignedStoreIds, phone, specialization, password } = body;

    if (!email || !name || !role) {
      return NextResponse.json({
        success: false,
        message: 'Email, name, and role are required'
      }, { status: 400 });
    }

    const existing = await clinicService.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({
        success: false,
        message: `A user with email ${email} already exists`
      }, { status: 400 });
    }

    const newUser = await clinicService.createUser({
      email,
      name,
      role,
      assignedStoreIds: assignedStoreIds || ['THN'],
      primaryStoreId: assignedStoreIds?.[0] || 'THN',
      phone: phone || '+91 98000 00000',
      specialization,
      password: password || 'Clinic@123',
      isActive: true,
    });

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ success: true, data: safeUser });
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
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const updated = await clinicService.updateUser(targetId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { password: _, ...safeUser } = updated;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

