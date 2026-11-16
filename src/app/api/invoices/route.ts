import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const status = searchParams.get('status') || undefined;
    const invoiceNo = searchParams.get('invoiceNo') || undefined;

    if (invoiceNo) {
      const inv = await clinicService.getInvoiceById(invoiceNo);
      if (!inv) {
        return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: inv });
    }

    const invoices = await clinicService.getInvoices(storeCode, status);
    return NextResponse.json({ success: true, data: invoices });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Staff updates or settles a bill (e.g. adding medicines/services, taking payment)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, items, subtotal, discount, tax, grandTotal, paidAmount, paymentMethod, status, staffName } = body;

    if (!invoiceId) {
      return NextResponse.json({ success: false, message: 'Invoice ID is required' }, { status: 400 });
    }

    const changeAmount = paymentMethod === 'Cash' && paidAmount && paidAmount > grandTotal ? paidAmount - grandTotal : 0;

    const updates: any = {
      items,
      subtotal,
      discount,
      tax,
      grandTotal,
      paidAmount: paidAmount || grandTotal,
      changeAmount,
      paymentMethod: paymentMethod || 'Cash',
      status: status || 'Paid',
      staffName,
      paidAt: status === 'Paid' ? new Date().toISOString() : undefined,
    };

    const updated = await clinicService.updateInvoice(invoiceId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Bill finalized and payment marked as Paid'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
