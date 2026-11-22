import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeCode = searchParams.get('storeCode') || undefined;
    const status = searchParams.get('status') || undefined;
    const invoiceNo = searchParams.get('invoiceNo') || undefined;
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
    const page = Number(searchParams.get('page')) || 1;

    if (invoiceNo) {
      const inv = await clinicService.getInvoiceById(invoiceNo);
      if (!inv) {
        return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: inv });
    }

    const invoices = await clinicService.getInvoices(storeCode, status, { limit, page });
    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        count: invoices.length,
      },
    });
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

    const changeAmount = paymentMethod === 'Cash' && paidAmount && grandTotal && paidAmount > grandTotal ? paidAmount - grandTotal : 0;

    const updates: any = {};
    if (items !== undefined) updates.items = items;
    if (subtotal !== undefined) updates.subtotal = subtotal;
    if (discount !== undefined) updates.discount = discount;
    if (tax !== undefined) updates.tax = tax;
    if (grandTotal !== undefined) updates.grandTotal = grandTotal;
    if (paidAmount !== undefined) updates.paidAmount = paidAmount;
    if (changeAmount !== undefined) updates.changeAmount = changeAmount;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (status !== undefined) updates.status = status;
    if (staffName !== undefined) updates.staffName = staffName;
    if (status === 'Paid') {
      updates.paidAt = new Date().toISOString();
      if (updates.paidAmount === undefined && grandTotal !== undefined) {
        updates.paidAmount = grandTotal;
      }
      if (updates.payableAmount === undefined && grandTotal !== undefined) {
        updates.payableAmount = grandTotal;
      }
      if (!updates.payments || updates.payments.length === 0) {
        updates.payments = [
          {
            mode: paymentMethod || 'Cash',
            amount: updates.paidAmount || grandTotal || 500,
            type: (paymentMethod || 'Cash') === 'Cash' ? 'cash' : 'non-cash',
          }
        ];
      }
    }

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
