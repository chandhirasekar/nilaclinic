import { NextResponse } from 'next/server';

export async function GET() {
  const salesTrend = [
    { day: 'Mon', revenue: 14200, appointments: 11 },
    { day: 'Tue', revenue: 18500, appointments: 14 },
    { day: 'Wed', revenue: 16800, appointments: 12 },
    { day: 'Thu', revenue: 22400, appointments: 16 },
    { day: 'Fri', revenue: 28900, appointments: 21 },
    { day: 'Sat', revenue: 38500, appointments: 29 },
    { day: 'Sun', revenue: 41200, appointments: 32 },
  ];

  const serviceBreakdown = [
    { name: 'Hair Services', percentage: 42, color: '#0284c7' },
    { name: 'Facial & Skin', percentage: 28, color: '#06b6d4' },
    { name: 'Spa & Body Care', percentage: 18, color: '#8b5cf6' },
    { name: 'Nails & Pedicure', percentage: 12, color: '#ec4899' },
  ];

  const paymentBreakdown = [
    { method: 'UPI / QR Code', amount: 98400, count: 68 },
    { method: 'Card (Credit/Debit)', amount: 56200, count: 35 },
    { method: 'Cash', amount: 25900, count: 22 },
  ];

  return NextResponse.json({
    success: true,
    data: {
      salesTrend,
      serviceBreakdown,
      paymentBreakdown,
      monthlyTotal: 180500,
      monthlyAppointments: 135,
      newCustomersThisMonth: 38,
      avgTicketSize: 1337,
    }
  });
}
