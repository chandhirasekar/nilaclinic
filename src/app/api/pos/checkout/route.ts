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
    const targetPayable = Number(payableAmount) || Number(grandTotal) || 0;
    let finalPayments = payments || [];
    let finalPaidAmount = paidAmount || targetPayable;
    let finalChangeAmount = changeAmount || 0;

    // If single payment mode or no payments specified, auto-adjust to targetPayable
    if (!finalPayments || finalPayments.length <= 1) {
      const mode = finalPayments?.[0]?.mode || paymentMethod || 'Cash';
      const origAmt = Number(finalPayments?.[0]?.amount) || targetPayable;
      if (mode.toLowerCase() === 'cash' && origAmt > targetPayable) {
        finalChangeAmount = origAmt - targetPayable;
      }
      finalPayments = [{
        mode,
        amount: targetPayable,
        type: finalPayments?.[0]?.type || (mode.toLowerCase() === 'cash' ? 'cash' : 'non-cash'),
      }];
      finalPaidAmount = targetPayable;
    } else {
      const totalPayments = finalPayments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
      if (Math.abs(totalPayments - targetPayable) > 0.5) {
        return NextResponse.json({
          success: false,
          message: `Total payment modes sum (₹${totalPayments}) must equal the payable amount (₹${targetPayable}).`
        }, { status: 400 });
      }
    }

    const invoiceNo = body.invoiceNo;
    let invoice = null;

    if (invoiceNo) {
      const existing = await clinicService.getInvoiceById(invoiceNo);
      if (existing) {
        invoice = await clinicService.updateInvoice(invoiceNo, {
          storeId: (storeId || existing.storeId || 'NILA-TH').toUpperCase(),
          customerId: customerId || existing.customerId,
          customerName: customerName || existing.customerName,
          customerMobile: customerMobile || customerPhone || existing.customerMobile,
          date: date || todayStr,
          items: items || existing.items,
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
          payments: finalPayments,
          paidAmount: finalPaidAmount,
          changeAmount: finalChangeAmount,
          paymentMethod: paymentMethod || (finalPayments?.[0]?.mode) || 'Cash',
          remarks: remarks || existing.remarks || '',
          staffName: staffName || existing.staffName || 'Staff',
          status: 'Paid',
          paidAt: new Date().toISOString(),
          visitId: visitId || existing.visitId,
        });

        // If package items were sold or redeemed, process them
        if (customerId) {
          for (const item of (items || [])) {
            if (item.type === 'package' && item.itemId) {
              await clinicService.sellCustomerPackage({
                customerId,
                packageId: item.itemId,
                storeSold: storeId || existing.storeId,
                invoiceNo: existing.invoiceNo,
              });
            }
            if (item.isFromPackage && item.packageId) {
              const rawServiceName = item.packageServiceName || item.name.replace(/\s*\(From Package:.*$/i, '').trim();
              await clinicService.redeemPackageSitting(item.packageId, rawServiceName, storeId || existing.storeId);
            }
          }
        }
      }
    }

    if (!invoice) {
      invoice = await clinicService.createQuickSaleInvoice({
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
        payments: finalPayments,
        paidAmount: finalPaidAmount,
        changeAmount: finalChangeAmount,
        paymentMethod: paymentMethod || (finalPayments?.[0]?.mode) || 'Cash',
        remarks: remarks || '',
        staffName: staffName || 'Staff',
        status: status || 'Paid',
        visitId,
      });
    }

    // Link and complete visit when bill is settled
    if (invoice && invoice.status === 'Paid') {
      try {
        const targetVisitId = invoice.visitId || visitId;
        if (targetVisitId) {
          await clinicService.updateVisit(targetVisitId, {
            billId: invoice.invoiceNo,
            status: 'Done',
          });
        } else if (customerId || customerMobile || customerPhone) {
          const clientVisits = await clinicService.getVisits(storeId || 'NILA-TH');
          const activeVisit = clientVisits.find(
            (v) =>
              (v.patientId === customerId ||
                (customerMobile && v.patientPhone === customerMobile) ||
                (customerPhone && v.patientPhone === customerPhone)) &&
              (v.status === 'Waiting' || v.status === 'In consultation' || !v.billId)
          );
          if (activeVisit) {
            await clinicService.updateVisit(activeVisit.visitId, {
              billId: invoice.invoiceNo,
              status: 'Done',
            });
          }
        }
      } catch (err) {
        console.error('Error linking visit to invoice on POS checkout:', err);
      }
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
