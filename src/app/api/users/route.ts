import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const role = searchParams.get('role') || undefined;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Shared active-doctors-of-this-store query (BUG-02)
    if (role === 'doctor' && activeOnly) {
      const activeDoctors = await clinicService.getActiveDoctors(storeCode);
      const safeDoctors = activeDoctors.map(({ password, ...rest }) => ({
        ...rest,
        _id: String(rest._id),
      }));
      return NextResponse.json({ success: true, data: safeDoctors });
    }

    let users = await clinicService.getUsers(storeCode);

    // Also include staff registered as Doctor or with system login access
    const staffList = await clinicService.getStaff(storeCode);
    const docStaff = staffList.filter(s => s.designation === 'Doctor' || s.hasLogin);
    for (const ds of docStaff) {
      const dsName = (ds.name || '').trim();
      const dsEmail = (ds.email || '').trim().toLowerCase();
      const matchedIdx = users.findIndex(u => {
        const uEmail = (u.email || '').trim().toLowerCase();
        const uName = (u.name || '').trim().toLowerCase();
        return (
          String(u._id) === String(ds._id) ||
          (dsEmail && uEmail && uEmail === dsEmail) ||
          (dsName && uName && uName === dsName.toLowerCase())
        );
      });

      if (matchedIdx !== -1) {
        // If staff master is deactivated, sync isActive to user representation
        if (ds.isActive === false) {
          users[matchedIdx].isActive = false;
        }
      } else {
        const cleanSlug = dsName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff';
        const roleAssigned = ds.designation === 'Doctor' ? 'doctor' : (ds.loginRole?.toLowerCase() === 'admin' ? 'admin' : 'staff');
        const safeEmail = ds.email || `${roleAssigned}.${cleanSlug}@nilaclinic.com`;
        users.push({
          _id: String(ds._id),
          name: dsName || 'Specialist',
          email: safeEmail,
          role: roleAssigned,
          phone: ds.mobile || '',
          image: ds.image || '',
          assignedStoreIds: ds.stores || (storeCode && storeCode !== 'ALL' ? [storeCode] : ['NILA-TH']),
          primaryStoreId: ds.stores?.[0] || (storeCode && storeCode !== 'ALL' ? storeCode : 'NILA-TH'),
          isActive: ds.isActive !== false,
          specialization: ds.designation === 'Doctor' ? 'Consulting Doctor' : undefined,
        } as any);
      }
    }

    if (role) {
      users = users.filter(u => u.role === role);
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
    const { email, name, role, assignedStoreIds, phone, specialization, password, image, qualification, experience, regNo, focus } = body;

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
      assignedStoreIds: assignedStoreIds || ['NILA-TH'],
      primaryStoreId: assignedStoreIds?.[0] || 'NILA-TH',
      phone: phone || '+91 98000 00000',
      specialization,
      image,
      qualification,
      experience,
      regNo,
      focus,
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

    if (updates.password === '' || updates.password === undefined) {
      delete updates.password;
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

