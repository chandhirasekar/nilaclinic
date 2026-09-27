import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/lib/models/Appointment';
import { IAppointment } from '@/types';

const initialAppointments: IAppointment[] = [
  { _id: '1', customerName: 'Priya Sharma', customerPhone: '+91 98450 11223', serviceName: 'Hydra Facial & Glowing Treatment', stylistName: 'Anitha R.', date: '2026-09-27', time: '10:00 AM', amount: 2499, status: 'Completed' },
  { _id: '2', customerName: 'Deepa Lakshmi', customerPhone: '+91 98765 88990', serviceName: 'Keratin Hair Spa & Trim', stylistName: 'Kavitha M.', date: '2026-09-27', time: '11:30 AM', amount: 3200, status: 'In Progress' },
  { _id: '3', customerName: 'Sangeetha Mohan', customerPhone: '+91 94431 55667', serviceName: 'Bridal Makeup & Nail Art', stylistName: 'Anitha R.', date: '2026-09-27', time: '01:00 PM', amount: 8500, status: 'Confirmed' },
  { _id: '4', customerName: 'Kavya S.', customerPhone: '+91 99011 22334', serviceName: 'Hair Coloring & Highlights', stylistName: 'Rajesh V.', date: '2026-09-27', time: '03:00 PM', amount: 4100, status: 'Scheduled' },
  { _id: '5', customerName: 'Meera Nair', customerPhone: '+91 91234 56789', serviceName: 'Pedicure & Manicure Deluxe', stylistName: 'Sujatha P.', date: '2026-09-27', time: '04:30 PM', amount: 1800, status: 'Scheduled' },
];

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const appointments = await Appointment.find().sort({ createdAt: -1 });
      if (appointments.length > 0) {
        return NextResponse.json({ success: true, data: appointments });
      }
    }
    return NextResponse.json({ success: true, data: initialAppointments });
  } catch (err) {
    return NextResponse.json({ success: true, data: initialAppointments });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    if (db) {
      const newAppt = await Appointment.create(body);
      return NextResponse.json({ success: true, data: newAppt });
    }
    const newAppt: IAppointment = { _id: Date.now().toString(), status: 'Scheduled', ...body };
    initialAppointments.unshift(newAppt);
    return NextResponse.json({ success: true, data: newAppt });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
