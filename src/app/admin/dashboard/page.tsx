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
  CalendarDays,
  ClipboardList,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useClinic } from '@/context/ClinicContext';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

export default function ClinicDashboardPage() {
  const { user, selectedStore, setSelectedStore, stores } = useClinic();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [dashboardApptFilter, setDashboardApptFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [settlingInvoiceId, setSettlingInvoiceId] = useState<string | null>(null);

  const userRole = user?.role || 'admin';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const repUrl = dateRange === 'custom'
        ? `/api/reports?storeCode=${selectedStore}&dateRange=custom&customDate=${customDate}`
        : `/api/reports?storeCode=${selectedStore}&dateRange=${dateRange}`;
      const apptDate = dateRange === 'custom' ? customDate : new Date().toISOString().split('T')[0];

      const [repRes, invRes, apptRes] = await Promise.all([
        fetch(repUrl),
        fetch(`/api/invoices?storeCode=${selectedStore}&status=Unpaid`),
        fetch(`/api/appointments?storeCode=${selectedStore}&date=${apptDate}`),
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
  }, [selectedStore, dateRange, customDate]);

  const [settlingAll, setSettlingAll] = useState(false);

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
          grandTotal: inv.grandTotal || inv.payableAmount || 500,
          paidAmount: inv.payableAmount || inv.grandTotal || 500,
          staffName: user?.name || 'Reception Staff',
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically remove from unpaid state immediately so it vanishes from dashboard
        setUnpaidInvoices((prev) => prev.filter((i) => (i.invoiceNo || i._id) !== invId));
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

  const handleSettleAllCash = async () => {
    if (unpaidInvoices.length === 0) return;
    if (!confirm(`Are you sure you want to mark all ${unpaidInvoices.length} pending consultation bills as Paid (Cash)?`)) return;
    setSettlingAll(true);
    try {
      for (const inv of unpaidInvoices) {
        const invId = inv.invoiceNo || inv._id;
        await fetch('/api/invoices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invId,
            status: 'Paid',
            paymentMethod: 'Cash',
            grandTotal: inv.grandTotal || inv.payableAmount || 500,
            paidAmount: inv.payableAmount || inv.grandTotal || 500,
            staffName: user?.name || 'Reception Staff',
          }),
        });
      }
      setUnpaidInvoices([]);
      await fetchDashboardData();
    } catch (e) {
      console.error('Error settling all:', e);
    } finally {
      setSettlingAll(false);
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

  const filteredDashboardAppts = todayAppointments.filter((a) => {
    if (dashboardApptFilter === 'ALL') return true;
    if (dashboardApptFilter === 'waiting') return a.status === 'Arrived' || a.status === 'Booked';
    if (dashboardApptFilter === 'in_service') return a.status === 'In consultation';
    if (dashboardApptFilter === 'completed') return a.status === 'Completed';
    return true;
  });

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

  // ================= 2 & 3. MIOSALON ELEVATED CLINIC & OPERATIONAL DASHBOARD (Admin & Staff) =================
  const bookedCount = todayAppointments.filter((a) => a.status === 'Booked').length;
  const arrivedCount = todayAppointments.filter((a) => a.status === 'Arrived').length;
  const inServiceCount = todayAppointments.filter((a) => a.status === 'In consultation').length;
  const completedApptCount = todayAppointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="space-y-5">
      {/* MioSalon Header with Store, Date Range & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Clinic Operational Dashboard</h1>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
              [{selectedStore}]
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Real-time appointment schedule, collections, doctor queue, and quick POS billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Store Switcher (For Admin) */}
          {userRole === 'admin' && (
            <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-sm">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-sm"
              >
                <option value="ALL">All Stores Combined</option>
                {stores.map((st) => (
                  <option key={st.code} value={st.code}>
                    [{st.code}] {st.name.replace('Nila Clinic - ', '')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Date Switcher with Date Picker (BUG-04) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-sm font-bold">
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setDateRange(r);
                  if (r === 'today') setCustomDate(new Date().toISOString().split('T')[0]);
                }}
                className={`px-3.5 py-1.5 rounded-lg capitalize transition-all ${
                  dateRange === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
            <div className="flex items-center pl-1.5 ml-1 border-l border-slate-200">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateRange('custom');
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  dateRange === 'custom'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
                title="Select specific date"
              />
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <Link
            href="/admin/appointments"
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>

          <Link
            href="/admin/pos"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-xs transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Quick Sale POS</span>
          </Link>
        </div>
      </div>

      {/* MioSalon 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Sales with Cash/Card/UPI breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {dateRange === 'today' ? "Today's" : dateRange === 'week' ? 'Weekly' : 'Monthly'} Net Sales
            </span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            ₹{kpi.totalRevenue.toLocaleString()}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-bold">
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
              Cash: ₹{(paymentModeTotals['Cash']?.amount || 0).toLocaleString()}
            </span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded border border-indigo-200">
              UPI: ₹{(paymentModeTotals['UPI']?.amount || 0).toLocaleString()}
            </span>
            <span className="px-2 py-0.5 bg-sky-50 text-sky-900 rounded border border-sky-200">
              Card: ₹{(paymentModeTotals['Card']?.amount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* KPI 2: Today's Appointments with status pills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Appointments Today</span>
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {todayAppointments.length} <span className="text-sm font-semibold text-slate-500">Bookings</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-bold">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
              {bookedCount} Booked
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded border border-amber-200">
              {arrivedCount} Arrived
            </span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded border border-purple-200">
              {inServiceCount} In Service
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
              {completedApptCount} Done
            </span>
          </div>
        </div>

        {/* KPI 3: Invoices & Average Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Bills & Average Ticket</span>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {kpi.paidBillsCount} <span className="text-sm font-semibold text-slate-500">Invoices Paid</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-sm text-slate-600 font-semibold">
            <span>Avg Bill: <strong className="text-slate-900">₹{kpi.paidBillsCount ? Math.round(kpi.totalRevenue / kpi.paidBillsCount) : 0}</strong></span>
            <span className="text-amber-800 font-bold">{unpaidInvoices.length} Unpaid</span>
          </div>
        </div>

        {/* KPI 4: Cash in Counter / Registry */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Cash in Counter</span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            ₹{(paymentModeTotals['Cash']?.amount || 0).toLocaleString()}
          </div>
          <div className="flex items-center justify-between pt-1 text-sm text-slate-600">
            <span className="text-emerald-800 font-bold">Ready for Day-End Cash Up</span>
            <span className="text-xs text-slate-600 font-medium">{paymentModeTotals['Cash']?.count || 0} Cash Bills</span>
          </div>
        </div>
      </div>

      {/* Unpaid Bills Waiting for Reception Payment (1-Click Settle or POS) */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2.5 text-amber-950 font-bold text-sm sm:text-base">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>Pending Doctor Consultation Bills Ready for Collection ({unpaidInvoices.length})</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSettleAllCash}
                disabled={settlingAll}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {settlingAll ? 'Settling All...' : 'Settle All as Paid (Cash)'}
              </button>
              <span className="text-xs text-amber-900 font-bold hidden sm:inline">• Awaiting billing settlement</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {unpaidInvoices.map((inv) => (
              <div key={inv._id || inv.invoiceNo} className="bg-white p-4 rounded-xl border border-amber-200 space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-base font-black text-slate-900">{inv.customerName}</span>
                  <span className="text-emerald-700 font-black text-base">₹{inv.payableAmount || inv.grandTotal}</span>
                </div>
                <div className="text-xs text-slate-600 font-medium flex justify-between">
                  <span className="font-mono">Bill #{inv.invoiceNo} <strong className="text-amber-800">[{inv.storeId || selectedStore}]</strong></span>
                  <span>By: {inv.staffName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={settlingInvoiceId === (inv.invoiceNo || inv._id)}
                    onClick={() => handleQuickCollectCash(inv)}
                    className="py-2 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50 shadow-xs"
                  >
                    {settlingInvoiceId === (inv.invoiceNo || inv._id) ? 'Saving...' : 'Quick Cash Pay'}
                  </button>
                  <Link
                    href={`/admin/pos?invoiceNo=${inv.invoiceNo}`}
                    className="py-2 text-center bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition-all shadow-xs"
                  >
                    POS & Print
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MioSalon Core Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================= COLUMN 1 (Left 7 cols): Live Appointment Stream & Reception Queue ================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Today&apos;s Appointments & Queue</h3>
                <p className="text-xs text-slate-500 font-medium">Live reception check-in and doctor queue tracking</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setDashboardApptFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dashboardApptFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({todayAppointments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardApptFilter('waiting')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dashboardApptFilter === 'waiting' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Waiting ({bookedCount + arrivedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardApptFilter('in_service')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dashboardApptFilter === 'in_service' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In Service ({inServiceCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardApptFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dashboardApptFilter === 'completed' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Done ({completedApptCount})
                </button>
              </div>
            </div>

            {/* Appointment Cards List (BUG-05: Scroll inside fixed-height box rather than running down whole page) */}
            {filteredDashboardAppts.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 space-y-2.5">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-medium">No appointments match the selected filter for today.</p>
                <Link
                  href="/admin/appointments"
                  className="inline-flex items-center space-x-1 text-emerald-700 font-bold hover:underline text-sm"
                >
                  <span>Book New Appointment</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto overscroll-contain pr-1.5 scrollbar-thin">
                {filteredDashboardAppts.map((a) => (
                  <div
                    key={a._id || a.appointmentId}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 transition-all shadow-2xs"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center font-mono shrink-0 shadow-2xs">
                        <span className="font-black text-slate-900 text-sm block">{a.startTime || a.time}</span>
                        <span className="text-xs text-slate-500 font-semibold">{a.durationMins || 30}m</span>
                      </div>
                      <div className="space-y-1">
                        {/* BUG-04: Show the Branch code/badge with every appointment */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-slate-900 text-base">{a.customerName}</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                            [{a.storeId || selectedStore}]
                          </span>
                          <span className="text-xs text-slate-500 font-mono font-medium">{a.customerPhone}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700 font-medium">
                          <span className="text-emerald-700 font-bold">{a.serviceName}</span>
                          <span>• Branch: <strong className="text-slate-900 font-mono font-semibold">[{a.storeId || selectedStore}]</strong></span>
                          <span>• Specialist: <strong className="text-slate-900">{a.staffName || a.doctorName}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 self-end sm:self-auto shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          a.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : a.status === 'Arrived'
                            ? 'bg-amber-100 text-amber-800'
                            : a.status === 'In consultation'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {a.status}
                      </span>

                      {a.status === 'Booked' && (
                        <Link
                          href="/admin/appointments"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Check-in
                        </Link>
                      )}

                      {a.status === 'Arrived' && (
                        <Link
                          href="/admin/patients"
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Doctor Queue
                        </Link>
                      )}

                      <Link
                        href={`/admin/pos?mobile=${encodeURIComponent(a.customerPhone)}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        Bill POS
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 2 (Right 5 cols): Collections, Specialists & Trend ================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Collections by Payment Mode */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
            <h3 className="font-black text-slate-900 text-base">Collections by Payment Mode</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm">Cash Counter</span>
                  <span className="text-xs text-emerald-800 font-medium">{paymentModeTotals['Cash']?.count || 0} Transactions</span>
                </div>
                <span className="text-lg font-black text-emerald-900">
                  ₹{(paymentModeTotals['Cash']?.amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-950 block text-sm">UPI / QR Code</span>
                  <span className="text-xs text-indigo-800 font-medium">{paymentModeTotals['UPI']?.count || 0} Transactions</span>
                </div>
                <span className="text-lg font-black text-indigo-900">
                  ₹{(paymentModeTotals['UPI']?.amount || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-950 block text-sm">Credit / Debit Card</span>
                  <span className="text-xs text-sky-800 font-medium">{paymentModeTotals['Card']?.count || 0} Transactions</span>
                </div>
                <span className="text-lg font-black text-sky-900">
                  ₹{(paymentModeTotals['Card']?.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Trend Graph */}
          {salesTrend.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <h3 className="font-black text-slate-900 text-sm">Sales Trend</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevMio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevMio)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
