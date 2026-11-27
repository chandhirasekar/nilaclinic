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
import { useInfiniteSlice } from '@/hooks/useInfiniteScroll';
import InfiniteScrollSentinel from '@/components/ui/InfiniteScrollSentinel';

type ReportType = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9';

export default function ReportsPage() {
  const { user, selectedStore, stores } = useClinic();
  const [activeReport, setActiveReport] = useState<ReportType>('R1');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [reportData, setReportData] = useState<any[]>([]);
  const [summaryItems, setSummaryItems] = useState<{ label: string; value: string }[]>([]);
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
        fetch(`/api/invoices?storeCode=${selectedStore}&limit=500`),
        fetch(`/api/appointments?storeCode=${selectedStore}`),
        fetch(`/api/customers?storeCode=${selectedStore}&limit=100`),
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

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Filter invoices & appointments by dateRange
      const filteredInvoices = invoices.filter((inv: any) => {
        if (dateRange === 'all') return true;
        const invDate = inv.date || (inv.createdAt ? inv.createdAt.split('T')[0] : '');
        if (dateRange === 'today') return invDate === todayStr;
        if (dateRange === 'week') {
          const d = new Date(invDate);
          const diffDays = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }
        if (dateRange === 'month') {
          const d = new Date(invDate);
          const diffDays = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 30;
        }
        return true;
      });

      const filteredAppts = appointments.filter((a: any) => {
        if (dateRange === 'all') return true;
        const aDate = a.date || '';
        if (dateRange === 'today') return aDate === todayStr;
        if (dateRange === 'week') {
          const d = new Date(aDate);
          const diffDays = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }
        if (dateRange === 'month') {
          const d = new Date(aDate);
          const diffDays = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return diffDays >= 0 && diffDays <= 30;
        }
        return true;
      });

      // Format report based on activeReport
      const formatINR = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

      if (activeReport === 'R1') {
        // Sales Summary
        const rows = filteredInvoices.map((i: any) => ({
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
        const totalRevenue = rows.filter((r: any) => r.status === 'Paid').reduce((sum: number, r: any) => sum + r.grandTotal, 0);
        const totalDiscounts = rows.reduce((sum: number, r: any) => sum + r.discount, 0);
        setSummaryItems([
          { label: 'Total Bills', value: String(rows.length) },
          { label: 'Paid Revenue', value: formatINR(totalRevenue) },
          { label: 'Total Discounts', value: formatINR(totalDiscounts) },
        ]);
      } else if (activeReport === 'R2') {
        // Daily Collection / Cash-up
        const rows = filteredInvoices.filter((i: any) => i.status === 'Paid').map((i: any) => {
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
        setSummaryItems([
          { label: 'Cash Total', value: formatINR(rows.reduce((sum: number, r: any) => sum + r.cash, 0)) },
          { label: 'Card Total', value: formatINR(rows.reduce((sum: number, r: any) => sum + r.card, 0)) },
          { label: 'UPI Total', value: formatINR(rows.reduce((sum: number, r: any) => sum + r.upi, 0)) },
          { label: 'Net Collected', value: formatINR(rows.reduce((sum: number, r: any) => sum + r.netCollected, 0)) },
        ]);
      } else if (activeReport === 'R3') {
        // Service & Product Sales
        const itemMap: Record<string, { name: string; type: string; qty: number; revenue: number }> = {};
        filteredInvoices.filter((i: any) => i.status === 'Paid').forEach((inv: any) => {
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
        setSummaryItems([
          { label: 'Unique Items', value: String(rows.length) },
          { label: 'Total Units Sold', value: String(rows.reduce((sum, r) => sum + r.qty, 0)) },
          { label: 'Total Item Revenue', value: formatINR(rows.reduce((sum, r) => sum + r.revenue, 0)) },
        ]);
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
        setSummaryItems([
          { label: 'Active Packages', value: String(rows.length) },
          { label: 'Total Sittings Catalog', value: String(rows.reduce((s: number, r: any) => s + (Number(r.totalSittings) || 0), 0)) },
        ]);
      } else if (activeReport === 'R5') {
        // Staff & Doctor Performance
        const perfMap: Record<string, any> = {};
        staffList.forEach((st: any) => {
          perfMap[st.name] = {
            staffName: st.name,
            designation: st.designation || 'Staff',
            stores: st.stores?.join(', ') || selectedStore,
            servicesCount: 0,
            revenue: 0,
            tips: 0,
          };
        });
        filteredInvoices.filter((i: any) => i.status === 'Paid').forEach((inv: any) => {
          if (inv.items && inv.items.length > 0) {
            inv.items.forEach((it: any) => {
              const sName = it.staffName || inv.staffName;
              if (sName) {
                if (!perfMap[sName]) {
                  perfMap[sName] = {
                    staffName: sName,
                    designation: 'Specialist',
                    stores: inv.storeId || selectedStore,
                    servicesCount: 0,
                    revenue: 0,
                    tips: 0,
                  };
                }
                perfMap[sName].revenue += Number(it.total) || 0;
                perfMap[sName].servicesCount += Number(it.quantity) || 1;
              }
            });
            const tipTarget = inv.tipStaffName || inv.staffName;
            if (tipTarget && perfMap[tipTarget]) {
              perfMap[tipTarget].tips += inv.tipAmount || 0;
            }
          } else {
            const sName = inv.staffName;
            if (sName) {
              if (!perfMap[sName]) {
                perfMap[sName] = {
                  staffName: sName,
                  designation: 'Staff',
                  stores: inv.storeId || selectedStore,
                  servicesCount: 0,
                  revenue: 0,
                  tips: 0,
                };
              }
              perfMap[sName].revenue += inv.grandTotal || 0;
              perfMap[sName].tips += inv.tipAmount || 0;
              perfMap[sName].servicesCount += 1;
            }
          }
        });
        const rows = Object.values(perfMap);
        setReportData(rows);
        setSummaryItems([
          { label: 'Specialists', value: String(rows.length) },
          { label: 'Services Completed', value: String(rows.reduce((s: number, r: any) => s + (r.servicesCount || 0), 0)) },
          { label: 'Total Revenue', value: formatINR(rows.reduce((s: number, r: any) => s + (r.revenue || 0), 0)) },
        ]);
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
        setSummaryItems([
          { label: 'Total Customers', value: String(rows.length) },
          { label: 'Total Visits', value: String(rows.reduce((s: number, r: any) => s + (r.visits || 0), 0)) },
          { label: 'Lifetime Spend', value: formatINR(rows.reduce((s: number, r: any) => s + (r.totalSpent || 0), 0)) },
        ]);
      } else if (activeReport === 'R7') {
        // Appointment Report
        const rows = filteredAppts.map((a: any) => ({
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
        setSummaryItems([
          { label: 'Total Bookings', value: String(rows.length) },
          { label: 'Completed', value: String(rows.filter((r: any) => r.status === 'Completed').length) },
          { label: 'Cancelled', value: String(rows.filter((r: any) => r.status === 'Cancelled').length) },
        ]);
      } else if (activeReport === 'R8') {
        // Discount Report
        const rows = filteredInvoices.filter((i: any) => (i.discount || 0) > 0 || (i.rowDiscountTotal || 0) > 0).map((i: any) => ({
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
        setSummaryItems([
          { label: 'Discounted Bills', value: String(rows.length) },
          { label: 'Total Discount Given', value: formatINR(rows.reduce((s: number, r: any) => s + (Number(r.discountAmount) || 0), 0)) },
          { label: 'Net Payable', value: formatINR(rows.reduce((s: number, r: any) => s + (Number(r.netPayable) || 0), 0)) },
        ]);
      } else if (activeReport === 'R9') {
        // Bill Register (Full Ledger)
        const rows = filteredInvoices.map((i: any) => ({
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
        setSummaryItems([
          { label: 'Total Invoices', value: String(rows.length) },
          { label: 'Total Payable', value: formatINR(rows.reduce((s: number, r: any) => s + (Number(r.payable) || 0), 0)) },
          { label: 'Total Paid', value: formatINR(rows.filter((r: any) => r.status === 'Paid').reduce((s: number, r: any) => s + (Number(r.paid) || 0), 0)) },
        ]);
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

  const currencyKeys = new Set([
    'subtotal',
    'discount',
    'tax',
    'grandTotal',
    'paid',
    'cash',
    'card',
    'upi',
    'neft',
    'changeGiven',
    'netCollected',
    'revenue',
    'price',
    'valuePerSitting',
    'tips',
    'totalSpent',
    'discountAmount',
    'netPayable',
    'payable',
    'change',
  ]);

  const formatCellValue = (key: string, val: any) => {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'number' && currencyKeys.has(key)) {
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return String(val);
  };

  const {
    visibleItems: visibleReportRows,
    hasMore: hasMoreReportRows,
    loadMore: loadMoreReportRows,
    visibleCount: visibleReportCount,
    totalCount: totalReportCount,
  } = useInfiniteSlice(reportData, 10, `${selectedStore}|${activeReport}|${dateRange}`);

  const dateRangeLabel =
    dateRange === 'today'
      ? 'Today'
      : dateRange === 'week'
      ? 'Last 7 Days'
      : dateRange === 'month'
      ? 'Last 30 Days'
      : 'All Time';

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Clinic Reports & Intelligence (R1 - R9)</h1>
            </div>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Module 9: 9 structured reports with Excel/CSV export, print layout, and cross-store filtering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: '7 Days' },
                  { id: 'month', label: '30 Days' },
                  { id: 'all', label: 'All Time' },
                ] as const
              ).map((dr) => (
                <button
                  key={dr.id}
                  type="button"
                  onClick={() => setDateRange(dr.id)}
                  className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    dateRange === dr.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dr.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!canExport}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
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
                  type="button"
                  onClick={() => setActiveReport(rKey)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{rKey}</span>
                  <span className="font-semibold text-xs opacity-90">{rInfo.title.replace(`${rKey}. `, '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Content Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900">{reportTitles[activeReport].title}</h2>
              <p className="text-sm text-slate-600 font-medium mt-0.5">{reportTitles[activeReport].subtitle}</p>
            </div>

            <div className="text-sm font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              Store Scope: <span className="font-bold text-slate-900">{selectedStore}</span> • Period: <span className="font-bold text-slate-900">{dateRangeLabel}</span> • Records: {reportData.length}
            </div>
          </div>

          {/* Summary Totals Strip */}
          {summaryItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">{item.label}</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading report records...</div>
          ) : reportData.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No records found for this report scope.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    {Object.keys(reportData[0]).map((h) => (
                      <th key={h} className="p-3.5 whitespace-nowrap">
                        {h.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleReportRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 font-mono text-xs sm:text-sm">
                      {Object.entries(row).map(([key, val], vIdx) => (
                        <td key={vIdx} className="p-3.5 whitespace-nowrap">
                          {formatCellValue(key, val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <InfiniteScrollSentinel
                hasMore={hasMoreReportRows}
                onLoadMore={loadMoreReportRows}
                visibleCount={visibleReportCount}
                totalCount={totalReportCount}
                itemLabel="records"
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= DEDICATED PRINT LAYOUT (BUG-08) ================= */}
      <div id="printable-report" className="hidden print:block bg-white text-slate-900 space-y-4">
        <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Nila Clinic — Skin &amp; Hair Care Clinic
            </h1>
            <h2 className="text-base font-bold text-slate-800 mt-0.5">
              {reportTitles[activeReport].title}
            </h2>
            <p className="text-xs text-slate-600">{reportTitles[activeReport].subtitle}</p>
          </div>
          <div className="text-right text-xs text-slate-700 space-y-0.5 shrink-0">
            <div>
              <strong>Store:</strong> {selectedStore}
            </div>
            <div>
              <strong>Date Filter:</strong> {dateRangeLabel}
            </div>
            <div>
              <strong>Records:</strong> {reportData.length}
            </div>
            <div>
              <strong>Printed:</strong> {new Date().toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {summaryItems.length > 0 && (
          <div className="grid grid-cols-4 gap-2 py-2 border-b border-slate-300">
            {summaryItems.map((item) => (
              <div key={item.label} className="p-2 border border-slate-300 rounded">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">{item.label}</span>
                <span className="text-sm font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {reportData.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-600 border border-slate-200 rounded">
            No records found for Store [{selectedStore}] ({dateRangeLabel}).
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[11px] text-slate-900">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-400">
                {Object.keys(reportData[0]).map((h) => (
                  <th key={h} className="p-2 font-bold uppercase tracking-wider border-x border-slate-200">
                    {h.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  {Object.entries(row).map(([key, val], vIdx) => (
                    <td key={vIdx} className="p-2 border-x border-slate-200">
                      {formatCellValue(key, val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
