'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  CreditCard,
  MessageCircle,
  Scissors,
  ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IAppointment } from '@/types';

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [appRes, repRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/reports')
        ]);
        const appData = await appRes.json();
        const repData = await repRes.json();
        if (appData.success) setAppointments(appData.data);
        if (repData.success) setReports(repData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const chartData = reports?.salesTrend || [
    { day: 'Mon', revenue: 14200 },
    { day: 'Tue', revenue: 18500 },
    { day: 'Wed', revenue: 16800 },
    { day: 'Thu', revenue: 22400 },
    { day: 'Fri', revenue: 28900 },
    { day: 'Sat', revenue: 38500 },
    { day: 'Sun', revenue: 41200 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title & Quick Salutation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nila Clinic Dashboard</h1>
          <p className="text-sm text-slate-500">Skin & Hair Care operations, billing & patient appointment tracking.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            WhatsApp Patient Auto-Sync Active
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹18,450</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+18.4% vs yesterday</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments Today</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">14 Patients</h3>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
            <span>4 Appointments upcoming</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialists Active</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">4 / 4 Staff</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            <span>100% Consultation Schedule</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹1,80,500</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>+24% Target Achieved</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Revenue Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Revenue & Business Performance</h3>
              <p className="text-xs text-slate-500">Skin & Hair Care revenue over the last 7 days</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              Live Clinic Analytics
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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

        {/* Quick Shortcut Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Quick Clinic Actions</h3>
            <p className="text-xs text-slate-500 mb-4">Fast actions to speed up your reception counter.</p>

            <div className="space-y-3">
              <Link
                href="/admin/pos"
                className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Point of Sale (POS)</h4>
                    <p className="text-[11px] text-slate-500">Create thermal invoice & collect bill</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>

              <Link
                href="/admin/appointments"
                className="flex items-center justify-between p-3.5 bg-sky-50 hover:bg-sky-100/80 border border-sky-200/60 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Book Patient Appointment</h4>
                    <p className="text-[11px] text-slate-500">Schedule patient with doctor/stylist</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-sky-600" />
              </Link>

              <button
                onClick={() => alert('WhatsApp Reminder Broadcast queued for today\'s patient appointments!')}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Patient Reminder</h4>
                    <p className="text-[11px] text-slate-500">Auto-send appointment alerts</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded">Auto</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">Location: Nila Clinic - Skin & Hair Care</span>
          </div>
        </div>

      </div>

      {/* Today's Appointments Timeline & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Today's Patient Schedule</h3>
            <p className="text-xs text-slate-500">Live consultation slots for Nila Clinic</p>
          </div>
          <Link href="/admin/appointments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View Full Schedule →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5">Patient</th>
                <th className="px-6 py-3.5">Treatment Requested</th>
                <th className="px-6 py-3.5">Specialist</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{appt.customerName}</div>
                    <div className="text-[11px] text-slate-400">{appt.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{appt.serviceName}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{appt.stylistName}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{appt.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      appt.status === 'In Progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      appt.status === 'Confirmed' ? 'bg-sky-100 text-sky-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
