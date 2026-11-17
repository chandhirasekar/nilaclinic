import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const dbConn = await connectToDatabase();
    if (!dbConn) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 500 });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, message: 'MongoDB connection handle unavailable' }, { status: 500 });
    }

    const collections = [
      'stores',
      'users',
      'staffs',
      'services',
      'products',
      'paymentmodes',
      'packagemasters',
      'clinicsettings',
      'customers',
      'patients',
      'customerpackages',
      'appointments',
      'visits',
      'invoices',
    ];

    const results: Record<string, number> = {};
    for (const colName of collections) {
      try {
        const res = await db.collection(colName).deleteMany({ isDummyData: true });
        results[colName] = res.deletedCount;
      } catch (e: any) {
        results[colName] = -1;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All dummy test data removed from MongoDB successfully',
      deletedCounts: results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

