'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  Filter,
  BarChart3,
  CreditCard,
  Package,
  Users,
  Stethoscope,
  Scissors,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useClinic } from '@/context/ClinicContext';

type ReportType = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9';

export default function ReportsPage() {
  const { user, selectedStore, stores } = useClinic();
  const [activeReport, setActiveReport] = useState<ReportType>('R1');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [reportData, setReportData] = useState<any[]>([]);
  const [summaryMetrics, setSummaryMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Settings for staff export permission check
  const [canExport, setCanExport] = useState(true);

  // Check user export permissions
  useEffect(() => {
    fetch('/api/masters/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const staffExportAllowed = data.data?.staffCanExport !== false;
          if (user?.role === 'staff' && !staffExportAllowed) {
            setCanExport(false);
          } else {
            setCanExport(true);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  // Load report data
  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [invRes, apptRes, custRes, staffRes, pkgRes] = await Promise.all([
        fetch(`/api/invoices?storeCode=${selectedStore}`),
        fetch(`/api/appointments?storeCode=${selectedStore}`),
        fetch(`/api/customers?storeCode=${selectedStore}`),
        fetch(`/api/masters/staff?storeCode=${selectedStore}`),
        fetch('/api/packages'),
      ]);

      const [invoices, appointments, customers, staffList, packages] = await Promise.all([
        invRes.json().then((r) => (r.success ? r.data || [] : [])),
        apptRes.json().then((r) => (r.success ? r.data || [] : [])),
        custRes.json().then((r) => (r.success ? r.data || [] : [])),
        staffRes.json().then((r) => (r.success ? r.data || [] : [])),
        pkgRes.json().then((r) => (r.success ? r.data || [] : [])),
      ]);

      const todayStr = new Date().toISOString().split('T')[0];

      // Format report based on activeReport
      if (activeReport === 'R1') {
        // Sales Summary
        const rows = invoices.map((i: any) => ({
          invoiceNo: i.invoiceNo,
          date: i.date,
          store: i.storeId,
          customer: i.customerName,
          itemsCount: (i.items || []).length,
          subtotal: i.subtotal || 0,
          discount: i.discount || 0,
          tax: i.tax || 0,
          grandTotal: i.grandTotal || 0,
          paid: i.paidAmount || 0,
          status: i.status,
        }));
        setReportData(rows);
        setSummaryMetrics({
          totalRevenue: rows.filter((r: any) => r.status === 'Paid').reduce((sum: number, r: any) => sum + r.grandTotal, 0),
          totalDiscounts: rows.reduce((sum: number, r: any) => sum + r.discount, 0),
          totalBills: rows.length,
        });
      } else if (activeReport === 'R2') {
        // Daily Collection / Cash-up
        const rows = invoices.filter((i: any) => i.status === 'Paid').map((i: any) => {
          let cash = 0;
          let card = 0;
          let upi = 0;
          let neft = 0;
          (i.payments || []).forEach((p: any) => {
            if (p.mode === 'Cash') cash += Number(p.amount) || 0;
            else if (p.mode === 'Card') card += Number(p.amount) || 0;
            else if (p.mode === 'UPI') upi += Number(p.amount) || 0;
            else if (p.mode === 'NEFT') neft += Number(p.amount) || 0;
          });
          if (!i.payments || i.payments.length === 0) {
            if (i.paymentMethod === 'Cash') cash = i.grandTotal;
            else if (i.paymentMethod === 'Card') card = i.grandTotal;
            else if (i.paymentMethod === 'UPI') upi = i.grandTotal;
          }
          return {
            invoiceNo: i.invoiceNo,
            date: i.date,
            store: i.storeId,
            customer: i.customerName,
            cash,
            card,
            upi,
            neft,
            changeGiven: i.changeAmount || 0,
            netCollected: (cash + card + upi + neft) - (i.changeAmount || 0),
          };
        });
        setReportData(rows);
        setSummaryMetrics({
          totalCash: rows.reduce((sum: number, r: any) => sum + r.cash, 0),
          totalCard: rows.reduce((sum: number, r: any) => sum + r.card, 0),
          totalUPI: rows.reduce((sum: number, r: any) => sum + r.upi, 0),
        });
      } else if (activeReport === 'R3') {
        // Service & Product Sales
        const itemMap: Record<string, { name: string; type: string; qty: number; revenue: number }> = {};
        invoices.filter((i: any) => i.status === 'Paid').forEach((inv: any) => {
          (inv.items || []).forEach((it: any) => {
            const key = it.name;
            if (!itemMap[key]) {
              itemMap[key] = { name: it.name, type: it.type || 'service', qty: 0, revenue: 0 };
            }
            itemMap[key].qty += Number(it.quantity) || 1;
            itemMap[key].revenue += Number(it.total) || 0;
          });
        });
        const rows = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);
        setReportData(rows);
        setSummaryMetrics({
          totalItemsSold: rows.reduce((sum, r) => sum + r.qty, 0),
          totalItemRevenue: rows.reduce((sum, r) => sum + r.revenue, 0),
        });
      } else if (activeReport === 'R4') {
        // Package Report
        const rows = packages.map((p: any) => ({
          packageName: p.name,
          type: p.type,
          price: p.price,
          totalSittings: p.totalSittings,
          valuePerSitting: p.valuePerSitting || Math.round(p.price / p.totalSittings),
          validityDays: p.validityDays,
          stores: p.availableStores?.join(', ') || 'ALL',
        }));
        setReportData(rows);
      } else if (activeReport === 'R5') {
        // Staff & Doctor Performance
        const perfMap: Record<string, any> = {};
        staffList.forEach((st: any) => {
          perfMap[st.name] = {
            staffName: st.name,
            designation: st.designation,
            stores: st.stores?.join(', '),
            servicesCount: 0,
            revenue: 0,
            tips: 0,
          };
        });
        invoices.filter((i: any) => i.status === 'Paid').forEach((inv: any) => {
          const sName = inv.staffName;
          if (sName && perfMap[sName]) {
            perfMap[sName].revenue += inv.grandTotal || 0;
            perfMap[sName].tips += inv.tipAmount || 0;
            perfMap[sName].servicesCount += (inv.items || []).length;
          }
        });
        const rows = Object.values(perfMap);
        setReportData(rows);
      } else if (activeReport === 'R6') {
        // Customer Report
        const rows = customers.map((c: any) => ({
          customerId: c.customerId,
          name: c.name,
          mobile: c.mobile,
          gender: c.gender,
          firstStore: c.firstStoreId,
          visits: c.visits || 0,
          totalSpent: c.totalSpent || 0,
          registeredAt: new Date(c.createdAt || Date.now()).toLocaleDateString(),
        }));
        setReportData(rows);
      } else if (activeReport === 'R7') {
        // Appointment Report
        const rows = appointments.map((a: any) => ({
          appointmentId: a.appointmentId || a._id,
          date: a.date,
          time: a.startTime || a.time,
          customer: a.customerName,
          phone: a.customerPhone,
          service: a.serviceName,
          specialist: a.staffName || a.doctorName || a.stylistName,
          store: a.storeId,
          status: a.status,
          cancelReason: a.cancelReason || '-',
        }));
        setReportData(rows);
      } else if (activeReport === 'R8') {
        // Discount Report
        const rows = invoices.filter((i: any) => (i.discount || 0) > 0 || (i.rowDiscountTotal || 0) > 0).map((i: any) => ({
          invoiceNo: i.invoiceNo,
          date: i.date,
          store: i.storeId,
          customer: i.customerName,
          staff: i.staffName,
          subtotal: i.subtotal,
          discountType: i.billDiscountType || 'value',
          discountAmount: i.discount,
          netPayable: i.payableAmount || i.grandTotal,
        }));
        setReportData(rows);
      } else if (activeReport === 'R9') {
        // Bill Register (Full Ledger)
        const rows = invoices.map((i: any) => ({
          invoiceNo: i.invoiceNo,
          date: i.date,
          store: i.storeId,
          customer: i.customerName,
          mobile: i.customerMobile || i.customerPhone,
          staff: i.staffName,
          payable: i.payableAmount || i.grandTotal,
          paid: i.paidAmount || i.grandTotal,
          change: i.changeAmount || 0,
          mode: (i.payments || []).map((p: any) => `${p.mode}: ₹${p.amount}`).join(', ') || i.paymentMethod || 'Cash',
          status: i.status,
          cancellationReason: i.cancellationReason || '-',
        }));
        setReportData(rows);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedStore, activeReport, dateRange]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!canExport) {
      alert('Export permission is disabled for Staff by Clinic Administration.');
      return;
    }
    if (reportData.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val}"`;
            }
            return val !== undefined && val !== null ? val : '';
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NilaClinic_${activeReport}_${selectedStore}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Report navigation titles
  const reportTitles: Record<ReportType, { title: string; subtitle: string; icon: any }> = {
    R1: { title: 'R1. Sales Summary Report', subtitle: 'Gross sales, discounts, taxes, and net revenue by store', icon: BarChart3 },
    R2: { title: 'R2. Daily Collection / Day-end Cash-up', subtitle: 'Cash, Card, UPI, and NEFT collection breakdown with cash change', icon: CreditCard },
    R3: { title: 'R3. Service & Product Sales Analysis', subtitle: 'Itemized units sold and revenue per treatment and retail item', icon: Scissors },
    R4: { title: 'R4. Package Sales & Sittings Ledger', subtitle: 'Treatment package sales, sittings balances, and store availability', icon: Package },
    R5: { title: 'R5. Staff & Specialist Performance', subtitle: 'Consultations, treatments performed, tips, and sales attribution', icon: Stethoscope },
    R6: { title: 'R6. Customer CRM & Cross-Store Registry', subtitle: 'Client visit frequency, first store of origin, and lifetime spend', icon: Users },
    R7: { title: 'R7. Appointment & Booking Ledger', subtitle: 'Scheduled, completed, cancelled appointments with reasons', icon: Calendar },
    R8: { title: 'R8. Discount & Concession Audit', subtitle: 'Invoice and line discounts with staff attribution', icon: Receipt },
    R9: { title: 'R9. Master Bill Register', subtitle: 'Sequential invoices, payment splits, receipt status, and audit log', icon: FileSpreadsheet },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Clinic Reports & Intelligence (R1 - R9)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Module 9: 9 structured reports with Excel/CSV export, role permissions, and cross-store filtering.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!canExport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* 9 Reports Selector Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max">
          {(Object.keys(reportTitles) as ReportType[]).map((rKey) => {
            const rInfo = reportTitles[rKey];
            const isActive = activeReport === rKey;
            return (
              <button
                key={rKey}
                onClick={() => setActiveReport(rKey)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{rKey}</span>
                <span className="font-normal text-[11px] opacity-90">{rInfo.title.replace(`${rKey}. `, '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">{reportTitles[activeReport].title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{reportTitles[activeReport].subtitle}</p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Store Scope: <span className="font-bold text-slate-800">{selectedStore}</span> • Records: {reportData.length}
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading report records...</div>
        ) : reportData.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No records found for this report scope.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  {Object.keys(reportData[0]).map((h) => (
                    <th key={h} className="p-3 whitespace-nowrap">
                      {h.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 font-mono text-[11px]">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="p-3 whitespace-nowrap">
                        {typeof val === 'number' && val > 99 ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
