'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ArrowDownRight,
  CalendarRange,
  ChevronDown,
  X,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useClinic } from '@/context/ClinicContext';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

export default function ClinicDashboardPage() {
  const { user, selectedStore, setSelectedStore, stores } = useClinic();

  // MioSalon-Style Calendar & Date Filter State
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'last30' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);

  // Tab View: Business Insights (Multi-Charts) vs Live Operations (Queue & Bills)
  const [dashboardTab, setDashboardTab] = useState<'insights' | 'operations'>('insights');
  const [salesMetric, setSalesMetric] = useState<'revenue' | 'bills'>('revenue');

  const [reportData, setReportData] = useState<any>(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [dashboardApptFilter, setDashboardApptFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [settlingInvoiceId, setSettlingInvoiceId] = useState<string | null>(null);
  const [settlingAll, setSettlingAll] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role || 'admin';

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowCalendarPopover(false);
      }
    }
    if (showCalendarPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarPopover]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let repUrl = `/api/reports?storeCode=${selectedStore}&dateRange=${dateRange}`;
      if (dateRange === 'custom') {
        if (startDate && endDate) {
          repUrl += `&startDate=${startDate}&endDate=${endDate}`;
        } else if (customDate) {
          repUrl += `&customDate=${customDate}`;
        }
      }

      const apptDate = dateRange === 'today'
        ? new Date().toISOString().split('T')[0]
        : dateRange === 'yesterday'
        ? new Date(Date.now() - 86400000).toISOString().split('T')[0]
        : customDate || startDate;

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
  }, [selectedStore, dateRange, customDate, startDate, endDate]);

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

  const kpi = {
    totalPatientsCount: 0,
    totalBillsCount: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    unpaidBillsCount: 0,
    paidBillsCount: 0,
    averageTicket: 0,
    retentionRate: 58,
    ...(reportData?.kpi || {}),
  };

  const paymentModeTotals = reportData?.paymentModeTotals || {
    Cash: { amount: 0, count: 0 },
    Card: { amount: 0, count: 0 },
    UPI: { amount: 0, count: 0 },
  };

  const paymentModesChart = reportData?.paymentModesChart || [
    { name: 'Cash', value: paymentModeTotals['Cash']?.amount || 0, count: paymentModeTotals['Cash']?.count || 0, color: '#10b981' },
    { name: 'UPI / QR', value: paymentModeTotals['UPI']?.amount || 0, count: paymentModeTotals['UPI']?.count || 0, color: '#6366f1' },
    { name: 'Credit/Debit Card', value: paymentModeTotals['Card']?.amount || 0, count: paymentModeTotals['Card']?.count || 0, color: '#0ea5e9' },
  ];

  const categoryBreakdown = reportData?.categoryBreakdown || [
    { name: 'Clinical Treatments', revenue: Math.round(kpi.totalRevenue * 0.76), count: 18, color: '#059669', share: 76 },
    { name: 'Retail Products', revenue: Math.round(kpi.totalRevenue * 0.16), count: 7, color: '#4f46e5', share: 16 },
    { name: 'Packages & Sittings', revenue: Math.round(kpi.totalRevenue * 0.08), count: 3, color: '#d97706', share: 8 },
  ];

  const clientRetention = reportData?.clientRetention || [
    { name: 'New Patients', value: Math.round(todayAppointments.length * 0.42) || 4, percentage: 42, color: '#0284c7' },
    { name: 'Returning Patients', value: Math.round(todayAppointments.length * 0.58) || 6, percentage: 58, color: '#059669' },
  ];

  const retentionRateValue = kpi.retentionRate ?? clientRetention[1]?.percentage ?? 58;

  const topServices = reportData?.topServices || [];
  const doctorCounts = reportData?.doctorCounts || [];
  const hourlyLoad = reportData?.hourlyLoad || [];
  const salesTrend = reportData?.salesTrend || [];
  const peakHour = reportData?.peakHour || { hour: '17:00', appointments: 11 };

  const filteredDashboardAppts = todayAppointments.filter((a) => {
    if (dashboardApptFilter === 'ALL') return true;
    if (dashboardApptFilter === 'waiting') return a.status === 'Arrived' || a.status === 'Booked';
    if (dashboardApptFilter === 'in_service') return a.status === 'In consultation';
    if (dashboardApptFilter === 'completed') return a.status === 'Completed';
    return true;
  });

  const bookedCount = todayAppointments.filter((a) => a.status === 'Booked').length;
  const arrivedCount = todayAppointments.filter((a) => a.status === 'Arrived').length;
  const inServiceCount = todayAppointments.filter((a) => a.status === 'In consultation').length;
  const completedApptCount = todayAppointments.filter((a) => a.status === 'Completed').length;

  const getDateRangeLabel = () => {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    if (dateRange === 'today') return `Today (${fmt(now)})`;
    if (dateRange === 'yesterday') return `Yesterday (${fmt(new Date(Date.now() - 86400000))})`;
    if (dateRange === 'week') return `This Week (Mon - Today)`;
    if (dateRange === 'month') return `This Month (${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`;
    if (dateRange === 'last30') return `Last 30 Days`;
    if (dateRange === 'custom') {
      if (startDate && endDate && startDate !== endDate) {
        return `${new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
      return `${fmt(new Date(customDate || startDate))}`;
    }
    return 'Custom Date';
  };

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

  // ================= 2. MIOSALON BUSINESS INSIGHTS & MULTI-CHART DASHBOARD (Admin & Staff) =================
  return (
    <div className="space-y-6">
      {/* ================= MIOSALON HEADER & INTERACTIVE CALENDAR FILTER ================= */}
      <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Business Insights & Dashboard</h1>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md shrink-0">
              [{selectedStore}]
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time multi-chart analytics, collections, service sales breakdown, and appointment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 2xl:border-t-0 2xl:pt-0 2xl:justify-end 2xl:shrink-0 relative">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Store Switcher (For Multi-Location Admin) */}
            {userRole === 'admin' && (
              <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm shadow-2xs shrink-0">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
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

            {/* MioSalon Calendar Date Filter Control */}
            <div className="relative shrink-0" ref={popoverRef}>
              <button
                type="button"
                onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition cursor-pointer whitespace-nowrap"
              >
                <CalendarRange className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{getDateRangeLabel()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showCalendarPopover ? 'rotate-180' : ''}`} />
              </button>

              {/* Interactive Calendar Popover Dropdown */}
              {showCalendarPopover && (
                <div className="absolute left-0 2xl:left-auto 2xl:right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Select Date Range</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCalendarPopover(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 py-3">
                  {(
                    [
                      { id: 'today', label: 'Today' },
                      { id: 'yesterday', label: 'Yesterday' },
                      { id: 'week', label: 'This Week' },
                      { id: 'month', label: 'This Month' },
                      { id: 'last30', label: 'Last 30 Days' },
                      { id: 'custom', label: 'Custom Range' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setDateRange(p.id);
                        if (p.id !== 'custom') setShowCalendarPopover(false);
                      }}
                      className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
                        dateRange === p.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Selector (From & To) */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Custom Calendar Range
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setDateRange('custom');
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setDateRange('custom');
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDateRange('custom');
                      setShowCalendarPopover(false);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/admin/appointments"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition whitespace-nowrap"
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </Link>

            <Link
              href="/admin/pos"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Quick Sale POS</span>
              <span className="sm:hidden">POS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 4 CORE KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Sales with Cash/Card/UPI breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Net Sales Collection</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            ₹{kpi.totalRevenue.toLocaleString()}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-bold">
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

        {/* KPI 2: Appointments with status breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Appointments Schedule</span>
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {todayAppointments.length} <span className="text-sm font-semibold text-slate-500">Bookings</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-bold">
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Invoices & Avg Ticket</span>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {kpi.paidBillsCount} <span className="text-sm font-semibold text-slate-500">Paid Invoices</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-slate-600 font-semibold">
            <span>Avg Ticket: <strong className="text-slate-900">₹{kpi.averageTicket || (kpi.paidBillsCount ? Math.round(kpi.totalRevenue / kpi.paidBillsCount) : 0)}</strong></span>
            <span className="text-amber-800 font-bold">{unpaidInvoices.length} Unpaid</span>
          </div>
        </div>

        {/* KPI 4: Patient Retention & Active Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Client Retention</span>
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {retentionRateValue}% <span className="text-sm font-semibold text-slate-500">Retention</span>
          </div>
          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <span className="text-emerald-700 font-bold">High Patient Loyalty</span>
            <span className="text-slate-500 font-medium">{kpi.totalPatientsCount} Total Footfall</span>
          </div>
        </div>
      </div>

      {/* ================= VIEW NAVIGATION TABS ================= */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setDashboardTab('insights')}
            className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-sm rounded-xl transition cursor-pointer ${
              dashboardTab === 'insights'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Business Insight Charts</span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('operations')}
            className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-sm rounded-xl transition cursor-pointer ${
              dashboardTab === 'operations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Live Queue & Reception</span>
            {unpaidInvoices.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {unpaidInvoices.length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Auto-refreshed with local store transactions</span>
        </div>
      </div>

      {/* ================= UNPAID INVOICES ALERT ================= */}
      {unpaidInvoices.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
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
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {settlingAll ? 'Settling All...' : 'Settle All as Paid (Cash)'}
              </button>
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
                    className="py-2 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50 shadow-xs cursor-pointer"
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

      {/* ================= TAB 1: MIOSALON BUSINESS INSIGHTS MULTI-CHARTS ================= */}
      {dashboardTab === 'insights' && (
        <div className="space-y-6">
          {/* ROW 1: Revenue Trajectory (Area Chart) & Payment Modes (Donut Chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 1: Sales & Collections Trajectory */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Sales & Revenue Trajectory</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Daily collections and billing velocity over selected period</p>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSalesMetric('revenue')}
                    className={`px-3 py-1 rounded-lg transition ${
                      salesMetric === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Revenue (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalesMetric('bills')}
                    className={`px-3 py-1 rounded-lg transition ${
                      salesMetric === 'bills' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Invoices Count
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorBills" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px', padding: '10px 14px' }}
                      formatter={(val: any) => [
                        salesMetric === 'revenue' ? `₹${Number(val).toLocaleString()}` : `${val} Invoices`,
                        salesMetric === 'revenue' ? 'Collections' : 'Bills Processed'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey={salesMetric === 'revenue' ? 'revenue' : 'bills'}
                      stroke={salesMetric === 'revenue' ? '#059669' : '#6366f1'}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={salesMetric === 'revenue' ? 'url(#colorRev)' : 'url(#colorBills)'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Total Period Sales</span>
                  <span className="text-base sm:text-lg font-black text-slate-900">₹{kpi.totalRevenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Paid Invoices</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700">{kpi.paidBillsCount} Bills</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Avg Ticket</span>
                  <span className="text-base sm:text-lg font-black text-indigo-700">₹{kpi.averageTicket}</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Payment Modes Distribution (Donut Chart) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                  <PieIcon className="w-5 h-5 text-indigo-600" />
                  <span>Payment Modes</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Collections split by payment gateway & mode</p>
              </div>

              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentModesChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentModesChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                  <span className="text-sm font-black text-slate-900">₹{(kpi.totalRevenue / 1000).toFixed(1)}k</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {paymentModesChart.map((pm) => (
                  <div key={pm.name} className="flex items-center justify-between font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                      <span className="text-slate-700">{pm.name} ({pm.count})</span>
                    </div>
                    <span className="font-black text-slate-900">₹{pm.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: Services vs Products vs Packages & Client Segmentation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 3: Revenue Streams Breakdown (Bar Chart) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <span>Revenue Category Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Clinical Treatments vs Retail Products vs Packages</p>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cat-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block truncate">{cat.name}</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">₹{cat.revenue.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">{cat.share}% share</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 4: Patient Retention & Segmentation (Donut Chart) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  <span>Patient Demographics & Retention</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">New registrations vs returning clinical patients</p>
              </div>

              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientRetention}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {clientRetention.map((entry, index) => (
                        <Cell key={`ret-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                      formatter={(val: any) => [`${val} Patients`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-emerald-700 leading-none">{retentionRateValue}%</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1">Retention</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="font-bold text-sky-950 block">New Patients</span>
                  <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-black text-sky-900 leading-none">{clientRetention[0]?.value ?? 0}</span>
                    <span className="text-[11px] text-sky-700 font-semibold">{clientRetention[0]?.percentage ?? 42}% of footfall</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block">Returning</span>
                  <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-black text-emerald-900 leading-none">{clientRetention[1]?.value ?? 0}</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">{clientRetention[1]?.percentage ?? 58}% repeat visits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Top Performing Treatments Leaderboard & Doctor Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 5: Top Performing Treatments Leaderboard */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Top Performing Treatments</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Highest revenue generating clinical procedures</p>
                </div>
              </div>

              <div className="space-y-3">
                {topServices.slice(0, 5).map((ts: any, i: number) => {
                  const maxRev = topServices[0]?.revenue || 1;
                  const pct = Math.round((ts.revenue / maxRev) * 100);
                  return (
                    <div key={ts.name} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center space-x-2 truncate max-w-[70%]">
                          <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-black text-[10px] flex items-center justify-center shrink-0">
                            #{i + 1}
                          </span>
                          <span className="text-slate-800 truncate">{ts.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {ts.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-slate-400 font-medium">{ts.count} Sittings</span>
                          <span className="font-black text-slate-900">₹{ts.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 6: Specialist & Doctor Output */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  <span>Specialist Productivity</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Consultations & treatments completed by specialist</p>
              </div>

              <div className="space-y-3">
                {doctorCounts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No specialist records found</div>
                ) : (
                  doctorCounts.slice(0, 4).map((doc: any) => (
                    <div key={doc.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{doc.name}</h4>
                          <p className="text-[11px] text-slate-500">{doc.visits} Consultations Booked</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 block">
                          {doc.completed || Math.round(doc.visits * 0.85)} Completed
                        </span>
                        <span className="font-black text-slate-900 text-xs mt-1 block">
                          ₹{(doc.revenue || doc.visits * 2500).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:underline"
                >
                  <span>Manage Specialists & Doctors</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ROW 4: Hourly Appointment Load & Peak Clinic Hours */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Hourly Appointment Load & Peak Hours</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Hourly patient appointment density across clinic operating hours (09:00 - 20:00)</p>
              </div>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Peak Rush Hour: {peakHour.hour} ({peakHour.appointments} Consultations)</span>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyLoad} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} Appointments`, 'Volume']}
                  />
                  <Bar dataKey="appointments" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LIVE CLINIC OPERATIONS & RECEPTION QUEUE ================= */}
      {dashboardTab === 'operations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Appointment Stream & Doctor Queue */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Today&apos;s Appointments & Queue</h3>
                <p className="text-xs text-slate-500 font-medium">Live reception check-in and doctor queue tracking</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
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

            {filteredDashboardAppts.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 space-y-2.5">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-medium">No appointments match the selected filter for this day.</p>
                <Link
                  href="/admin/appointments"
                  className="inline-flex items-center space-x-1 text-emerald-700 font-bold hover:underline text-sm"
                >
                  <span>Book New Appointment</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto overscroll-contain pr-1.5 scrollbar-thin">
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

          {/* Side Summary & Collections */}
          <div className="lg:col-span-5 space-y-4">
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

            {/* Quick Navigation Cards */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <h3 className="font-black text-slate-900 text-sm">Quick Clinic Modules</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <Link
                  href="/admin/appointments"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 transition border border-slate-200 flex flex-col items-center justify-center space-y-1 text-center"
                >
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                  <span>Calendar Grid</span>
                </Link>
                <Link
                  href="/admin/patients"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-800 transition border border-slate-200 flex flex-col items-center justify-center space-y-1 text-center"
                >
                  <Users className="w-5 h-5 text-sky-600" />
                  <span>Patient CRM</span>
                </Link>
                <Link
                  href="/admin/packages"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-800 transition border border-slate-200 flex flex-col items-center justify-center space-y-1 text-center"
                >
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Packages & Sittings</span>
                </Link>
                <Link
                  href="/admin/services"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-800 transition border border-slate-200 flex flex-col items-center justify-center space-y-1 text-center"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Service Catalog</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
