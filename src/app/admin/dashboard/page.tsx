'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  Users,
  CreditCard,
  Clock,
  TrendingUp,
  Stethoscope,
  Building2,
  Calendar,
  ArrowUpRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useClinic } from '@/context/ClinicContext';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

export default function ClinicDashboardPage() {
  const { user, selectedStore, setSelectedStore, stores } = useClinic();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [reportData, setReportData] = useState<any>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingInvoiceId, setSettlingInvoiceId] = useState<string | null>(null);

  const userRole = user?.role || 'admin';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [repRes, invRes, apptRes] = await Promise.all([
        fetch(`/api/reports?storeCode=${selectedStore}&dateRange=${dateRange}`),
        fetch(`/api/invoices?storeCode=${selectedStore}&status=Unpaid`),
        fetch(`/api/appointments?storeCode=${selectedStore}&date=${new Date().toISOString().split('T')[0]}`),
      ]);

      const repData = await repRes.json();
      const invData = await invRes.json();
      const apptData = await apptRes.json();

      if (repData.success) setReportData(repData.data);
      if (invData.success) setUnpaidInvoices(invData.data || []);
      if (apptData.success) setTodayAppointments(apptData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStore, dateRange]);

  const handleQuickCollectCash = async (inv: any) => {
    const invId = inv.invoiceNo || inv._id;
    setSettlingInvoiceId(invId);
    try {
      const res = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invId,
          status: 'Paid',
          paymentMethod: 'Cash',
          paidAmount: inv.payableAmount || inv.grandTotal,
          staffName: user?.name || 'Reception Staff',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to settle bill');
      }
    } catch (e) {
      alert('Error settling bill');
    } finally {
      setSettlingInvoiceId(null);
    }
  };

  const kpi = reportData?.kpi || {
    totalPatientsCount: 0,
    totalBillsCount: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    unpaidBillsCount: 0,
    paidBillsCount: 0,
  };

  const paymentModeTotals = reportData?.paymentModeTotals || {
    Cash: { amount: 0, count: 0 },
    Card: { amount: 0, count: 0 },
    UPI: { amount: 0, count: 0 },
  };

  const doctorCounts = reportData?.doctorCounts || [];
  const staffCounts = reportData?.staffCounts || [];
  const salesTrend = reportData?.salesTrend || [];
  const storeBreakdown = reportData?.storeBreakdown || [];

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-200 rounded-2xl w-full animate-pulse" />
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableSkeleton rows={4} columns={4} />
          <TableSkeleton rows={4} columns={4} />
        </div>
      </div>
    );
  }

  // ================= 1. DOCTOR DASHBOARD (Rule BR-03: No bills or financial amounts) =================
  if (userRole === 'doctor') {
    const myDoctorName = user?.name || 'Doctor';
    const myAppointments = todayAppointments.filter(
      (a) => a.doctorName === myDoctorName || a.staffName === myDoctorName || a.stylistName === myDoctorName
    );
    const waitingCount = myAppointments.filter((a) => a.status === 'Arrived' || a.status === 'Booked').length;
    const completedCount = myAppointments.filter((a) => a.status === 'Completed').length;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-sky-500/30 rounded-lg">
                <Stethoscope className="w-5 h-5 text-sky-300" />
              </span>
              <h1 className="text-xl font-bold tracking-tight">Doctor Clinical Dashboard</h1>
            </div>
            <p className="text-xs text-sky-200 mt-1">
              Welcome, {myDoctorName} • Clinical consultations schedule for store [{selectedStore}]
            </p>
          </div>

          <Link
            href="/admin/doctor"
            className="flex items-center space-x-1.5 bg-sky-500 hover:bg-sky-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
          >
            <span>Open Consultation Panel</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Doctor Clinical KPI Cards (NO Financial Figures) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Today&apos;s Appointments</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{myAppointments.length}</div>
            <span className="text-[11px] text-sky-600 font-semibold mt-1 block">Scheduled on calendar</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Arrived / In Queue</span>
            <div className="text-3xl font-black text-amber-600 mt-1">{waitingCount}</div>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Ready for consultation</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Completed Consultations</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{completedCount}</div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Case notes recorded</span>
          </div>
        </div>

        {/* Doctor Assigned Patients List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Today&apos;s Patient Schedule</h3>
            <span className="text-xs text-slate-400">Total: {myAppointments.length} Bookings</span>
          </div>

          {myAppointments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No consultations booked for your schedule today.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAppointments.map((a) => (
                <div key={a._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs">
                      {a.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{a.customerName}</h4>
                      <p className="text-[11px] text-slate-400">{a.serviceName} • {a.startTime || a.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'Arrived'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {a.status}
                    </span>
                    <Link
                      href="/admin/doctor"
                      className="px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-lg text-xs"
                    >
                      Examine
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= 2. STAFF DASHBOARD (Own Store Billing & Reception) =================
  if (userRole === 'staff') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Store Reception & Billing Counter</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Store [{selectedStore}]: Appointments check-in, doctor consultation bills, and Quick Sale POS.
            </p>
          </div>

          <Link
            href="/admin/pos"
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Launch Quick Sale POS</span>
          </Link>
        </div>

        {/* Staff KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Today&apos;s Store Revenue</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{kpi.totalRevenue.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">{kpi.paidBillsCount} Invoices Paid</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Unpaid Bills (Doctor Queue)</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{unpaidInvoices.length}</div>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Awaiting payment collection</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Today&apos;s Appointments</span>
            <div className="text-2xl font-black text-sky-700 mt-1">{todayAppointments.length}</div>
            <span className="text-[11px] text-sky-600 font-semibold mt-1 block">Booked clients</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Cash In Counter</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{(paymentModeTotals['Cash']?.amount || 0).toLocaleString()}</div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Ready for day-end cash up</span>
          </div>
        </div>

        {/* Unpaid Bills Waiting for Reception Payment */}
        {unpaidInvoices.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Pending Doctor Consultation Bills Ready for Collection</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {unpaidInvoices.map((inv) => (
                <div key={inv._id} className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{inv.customerName}</span>
                    <span className="text-emerald-700 font-mono">₹{inv.payableAmount || inv.grandTotal}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Invoice: {inv.invoiceNo}</span>
                    <span>By: {inv.staffName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      disabled={settlingInvoiceId === (inv.invoiceNo || inv._id)}
                      onClick={() => handleQuickCollectCash(inv)}
                      className="py-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-all disabled:opacity-50"
                    >
                      {settlingInvoiceId === (inv.invoiceNo || inv._id) ? 'Saving...' : 'Quick Cash Pay'}
                    </button>
                    <Link
                      href={`/admin/pos?invoiceNo=${inv.invoiceNo}`}
                      className="py-1 text-center bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px] transition-all"
                    >
                      POS & Print
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Appointments with Direct Check-in */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Today&apos;s Appointments Schedule</h3>
            <Link href="/admin/appointments" className="text-xs text-sky-600 font-semibold hover:underline">
              View Calendar →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.map((a) => (
              <div key={a._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{a.customerName}</span>
                  <span className="text-slate-400 ml-2 font-mono">{a.startTime || a.time}</span>
                  <div className="text-[11px] text-slate-500">{a.serviceName} • Specialist: {a.staffName || a.doctorName}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : a.status === 'Arrived'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {a.status}
                  </span>
                  <Link
                    href={`/admin/pos?mobile=${encodeURIComponent(a.customerPhone)}`}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Bill POS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. ADMIN DASHBOARD (All Stores Global View) =================
  return (
    <div className="space-y-6">
      {/* Top Header & Store/Date Filter Controls (FR-27) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Operational Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-store metrics, patient counts, doctor workload, and POS collections.
          </p>
        </div>

        {/* Filters (FR-27) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stores Combined</option>
              {stores.map((st) => (
                <option key={st.code} value={st.code}>
                  [{st.code}] {st.name.replace('Nila Clinic - ', '')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  dateRange === r ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {dateRange === 'today' ? "Today's" : dateRange === 'week' ? 'Weekly' : 'Monthly'} Net Sales
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹{kpi.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{kpi.paidBillsCount} Paid Invoices Collected</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients Attended</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.totalPatientsCount} Consultations</h3>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-sky-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-sky-500" />
            <span>Cross-store queue tracking</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoices Processed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.totalBillsCount} Invoices</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-purple-600 font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Avg Ticket: ₹{kpi.totalBillsCount ? Math.round(kpi.totalRevenue / kpi.totalBillsCount) : 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Doctor Bills</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">₹{kpi.pendingPayments.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-amber-700 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
            <span>{kpi.unpaidBillsCount} Invoices Pending Collection</span>
          </div>
        </div>
      </div>

      {/* Branch-Wise Performance Grid for Admin Multi-Store (Bug 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Multi-Branch Performance Overview ({storeBreakdown.length || stores.length} Branches)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Consolidated real-time metrics across all Nila Clinic locations. Click any branch to focus view.
            </p>
          </div>
          <button
            onClick={() => setSelectedStore('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStore === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {selectedStore === 'ALL' ? '✓ Showing All Branches' : 'View All (Consolidated)'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {(storeBreakdown.length > 0 ? storeBreakdown : stores).map((st: any) => {
            const code = st.storeId || st.code;
            const name = st.name ? st.name.replace('Nila Clinic - ', '') : code;
            const revenue = st.revenue !== undefined ? st.revenue : 0;
            const invoices = st.invoices !== undefined ? st.invoices : 0;
            const isSelected = selectedStore.toUpperCase() === code.toUpperCase();

            return (
              <div
                key={code}
                onClick={() => setSelectedStore(code)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">[{code}]</span>
                    {isSelected && (
                      <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs mt-1 truncate" title={name}>
                    {name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Revenue</span>
                    <span className="font-black text-slate-900 text-xs">₹{Number(revenue).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Bills</span>
                    <span className="font-bold text-slate-700">{invoices}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modes Split (FR-25) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Collections by Payment Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
            <span className="text-emerald-800 font-bold block">Cash</span>
            <div className="text-xl font-black text-emerald-900 mt-1">
              ₹{(paymentModeTotals['Cash']?.amount || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600">{paymentModeTotals['Cash']?.count || 0} Transactions</span>
          </div>

          <div className="p-4 bg-sky-50/70 border border-sky-200/60 rounded-xl">
            <span className="text-sky-800 font-bold block">Card</span>
            <div className="text-xl font-black text-sky-900 mt-1">
              ₹{(paymentModeTotals['Card']?.amount || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-sky-600">{paymentModeTotals['Card']?.count || 0} Transactions</span>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-xl">
            <span className="text-indigo-800 font-bold block">UPI</span>
            <div className="text-xl font-black text-indigo-900 mt-1">
              ₹{(paymentModeTotals['UPI']?.amount || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-indigo-600">{paymentModeTotals['UPI']?.count || 0} Transactions</span>
          </div>
        </div>
      </div>

      {/* Doctor & Staff Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Doctor Consultation Activity</h3>
          <div className="space-y-3">
            {doctorCounts.map((doc: any) => (
              <div key={doc.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-[10px] text-slate-400">Consulting Specialist</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{doc.visits} Patient(s)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{doc.completed} Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Staff Collections Activity</h3>
          <div className="space-y-3">
            {staffCounts.map((st: any) => (
              <div key={st.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{st.name}</h4>
                  <p className="text-[10px] text-slate-400">{st.billsProcessed} Bills Processed</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 text-sm">₹{st.revenueCollected}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Collected</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Revenue Flow Trend</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
