import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      storeId,
      customerId,
      customerName,
      customerMobile,
      customerPhone,
      date,
      items,
      subtotal,
      rowDiscountTotal,
      billDiscountType,
      billDiscountValue,
      discount,
      tax,
      grandTotal,
      tipAmount,
      tipStaffName,
      payableAmount,
      payments,
      paidAmount,
      changeAmount,
      paymentMethod,
      remarks,
      staffName,
      staffRole,
      status,
      visitId,
    } = body;

    const settings = await clinicService.getSettings();

    // FR-55: Back-dated billing check
    const todayStr = new Date().toISOString().split('T')[0];
    if (date && date !== todayStr) {
      const allowedRoles = settings.backDatedBillingRoles.map(r => r.toLowerCase());
      const userRole = (staffRole || 'staff').toLowerCase();
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json({
          success: false,
          message: `Back-dated billing is restricted. Only ${settings.backDatedBillingRoles.join(', ')} can bill for past dates.`
        }, { status: 403 });
      }
    }

    // FR-45: Staff discount cap validation
    if (staffRole !== 'admin' && billDiscountType === 'percent' && billDiscountValue > settings.maxStaffDiscountPercent) {
      return NextResponse.json({
        success: false,
        message: `Discount of ${billDiscountValue}% exceeds the maximum staff limit of ${settings.maxStaffDiscountPercent}%. Admin authorization required.`
      }, { status: 400 });
    }

    // FR-46: Validate payments add up to payable amount
    const totalPayments = (payments || []).reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
    const targetPayable = Number(payableAmount) || Number(grandTotal) || 0;

    // Allow margin of 0.05 for minor floating point rounding
    if (payments && payments.length > 0 && Math.abs(totalPayments - targetPayable) > 0.5) {
      return NextResponse.json({
        success: false,
        message: `Total payment modes sum (₹${totalPayments}) must equal the payable amount (₹${targetPayable}).`
      }, { status: 400 });
    }

    const invoice = await clinicService.createQuickSaleInvoice({
      storeId: (storeId || 'NILA-TH').toUpperCase(),
      customerId,
      customerName: customerName || 'Walk-in Client',
      customerMobile: customerMobile || customerPhone || '+91 90000 00000',
      date: date || todayStr,
      items: items || [],
      subtotal: subtotal || 0,
      rowDiscountTotal: rowDiscountTotal || 0,
      billDiscountType,
      billDiscountValue,
      discount: discount || 0,
      tax: tax || 0,
      grandTotal: grandTotal || 0,
      tipAmount: tipAmount || 0,
      tipStaffName: tipStaffName || '',
      payableAmount: targetPayable,
      payments: payments || [{ mode: paymentMethod || 'Cash', amount: targetPayable }],
      paidAmount: paidAmount || targetPayable,
      changeAmount: changeAmount || 0,
      paymentMethod: paymentMethod || (payments?.[0]?.mode) || 'Cash',
      remarks: remarks || '',
      staffName: staffName || 'Staff',
      status: status || 'Paid',
      visitId,
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
