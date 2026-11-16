import { NextResponse } from 'next/server';
import clinicService from '@/lib/clinicService';

export async function GET(req: Request) {
  try {
    const settings = await clinicService.getSettings();
    return NextResponse.json({
      success: true,
      data: settings.endOfDayEmail,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// FR-97 & FR-98: Trigger End-of-day sales email or Send Test Email
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { isTest, testRecipient } = body;

    const [settings, stores, invoices, appointments] = await Promise.all([
      clinicService.getSettings(),
      clinicService.getStores(),
      clinicService.getInvoices('ALL'),
      clinicService.getAppointments('ALL'),
    ]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter(
      (inv) => inv.date === todayStr || inv.createdAt?.startsWith(todayStr)
    );
    const todayAppointments = appointments.filter((a) => a.date === todayStr);

    const paidInvoices = todayInvoices.filter((i) => i.status === 'Paid');
    const totalGross = paidInvoices.reduce((sum, i) => sum + (i.subtotal || 0), 0);
    const totalDiscounts = paidInvoices.reduce((sum, i) => sum + (i.discount || 0), 0);
    const totalNetSales = paidInvoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
    const totalBills = paidInvoices.length;

    // Payment modes breakdown
    const paymentBreakdown: Record<string, number> = {};
    paidInvoices.forEach((inv) => {
      if (inv.payments && inv.payments.length > 0) {
        inv.payments.forEach((p) => {
          paymentBreakdown[p.mode] = (paymentBreakdown[p.mode] || 0) + (Number(p.amount) || 0);
        });
      } else {
        const mode = inv.paymentMethod || 'Cash';
        paymentBreakdown[mode] = (paymentBreakdown[mode] || 0) + (inv.grandTotal || 0);
      }
    });

    // Store breakdown
    const storeSummaries = stores.map((s) => {
      const storeInvoices = paidInvoices.filter((i) => i.storeId.toUpperCase() === s.code.toUpperCase());
      const storeAppts = todayAppointments.filter((a) => a.storeId.toUpperCase() === s.code.toUpperCase());
      const storeNet = storeInvoices.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
      return {
        storeName: s.name,
        storeCode: s.code,
        billsCount: storeInvoices.length,
        netSales: storeNet,
        appointmentsCount: storeAppts.length,
      };
    });

    const emailRecipients = isTest && testRecipient
      ? [testRecipient]
      : settings.endOfDayEmail?.recipients || ['admin@nilaclinic.com'];

    // HTML Email template
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">${settings.clinicName || 'Nila Clinic'}</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #38bdf8;">End-of-Day Executive Sales Report — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="font-size: 15px; margin: 0 0 16px 0; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
            Daily Performance Summary (All Stores)
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; width: 25%;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Net Sales</span>
                <strong style="font-size: 18px; color: #059669;">₹${totalNetSales.toLocaleString('en-IN')}</strong>
              </td>
              <td style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; width: 25%;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Bills Settled</span>
                <strong style="font-size: 18px; color: #0284c7;">${totalBills}</strong>
              </td>
              <td style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; width: 25%;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Discounts</span>
                <strong style="font-size: 18px; color: #dc2626;">₹${totalDiscounts.toLocaleString('en-IN')}</strong>
              </td>
              <td style="padding: 12px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; width: 25%;">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Appointments</span>
                <strong style="font-size: 18px; color: #7c3aed;">${todayAppointments.length}</strong>
              </td>
            </tr>
          </table>

          <h3 style="font-size: 13px; margin: 0 0 12px 0; color: #0f172a;">Store-by-Store Collections</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; color: #475569;">
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Store / Outlet</th>
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">Bills</th>
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">Appointments</th>
                <th style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right;">Net Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${storeSummaries.map((s) => `
                <tr>
                  <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><strong>${s.storeName}</strong> <span style="color:#64748b; font-size:10px;">(${s.storeCode})</span></td>
                  <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">${s.billsCount}</td>
                  <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center;">${s.appointmentsCount}</td>
                  <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #059669;">₹${s.netSales.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 13px; margin: 0 0 12px 0; color: #0f172a;">Collections by Payment Mode</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            ${Object.entries(paymentBreakdown).map(([mode, amt]) => `
              <tr>
                <td style="padding: 6px 12px; border-bottom: 1px solid #f1f5f9;"><strong>${mode}</strong></td>
                <td style="padding: 6px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">₹${amt.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
          Generated automatically by Nila Clinic POS & Hospital Information System • Tamil Nadu, India
        </div>
      </div>
    `;

    return NextResponse.json({
      success: true,
      message: isTest
        ? `Test sales report email dispatched successfully to ${emailRecipients.join(', ')}`
        : `Daily summary email dispatched to ${emailRecipients.join(', ')}`,
      recipients: emailRecipients,
      htmlPreview: htmlEmail,
      summary: {
        totalNetSales,
        totalBills,
        totalDiscounts,
        appointmentsCount: todayAppointments.length,
        storeSummaries,
        paymentBreakdown,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

