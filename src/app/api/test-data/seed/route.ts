import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import clinicService from '@/lib/clinicService';

export async function POST(req: Request) {
  try {
    const dbConn = await connectToDatabase();
    if (!dbConn) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Dummy test data is available and active in database',
      stores: (await clinicService.getStores()).length,
      customers: (await clinicService.getCustomers()).length,
      appointments: (await clinicService.getAppointments()).length,
      visits: (await clinicService.getVisits()).length,
      invoices: (await clinicService.getInvoices()).length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

