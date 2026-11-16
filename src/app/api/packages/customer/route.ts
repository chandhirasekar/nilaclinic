import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ success: false, message: 'Customer ID is required' }, { status: 400 });
    }

    const packages = await clinicService.getCustomerPackages(customerId);
    return NextResponse.json({ success: true, data: packages });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, customerPackageId, serviceName, storeCode, deltaSittings, newExpiryDate, reason, byUser } = body;

    // Action 1: Redeem a sitting (FR-36)
    if (action === 'redeem') {
      if (!customerPackageId || !serviceName || !storeCode) {
        return NextResponse.json(
          { success: false, message: 'Package ID, Service Name, and Store are required to redeem sitting' },
          { status: 400 }
        );
      }

      const res = await clinicService.redeemPackageSitting(customerPackageId, serviceName, storeCode);
      if (!res.success) {
        return NextResponse.json({ success: false, message: res.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: res.package, message: res.message });
    }

    // Action 2: Admin adjustment (FR-39)
    if (action === 'adjust') {
      if (!customerPackageId || deltaSittings === undefined) {
        return NextResponse.json(
          { success: false, message: 'Package ID and delta sittings are required' },
          { status: 400 }
        );
      }

      const res = await clinicService.adjustCustomerPackage(
        customerPackageId,
        Number(deltaSittings),
        newExpiryDate,
        reason || 'Admin Adjustment',
        byUser || 'Admin'
      );

      if (!res) {
        return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: res, message: 'Customer package adjusted successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

