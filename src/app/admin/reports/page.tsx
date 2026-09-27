'use client';

import React, { useState, useEffect } from 'react';
import { Download, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadReports();
  }, []);

  const servicePie = data?.serviceBreakdown || [
    { name: 'Hair Services', percentage: 42, color: '#0284c7' },
    { name: 'Facial & Skin', percentage: 28, color: '#06b6d4' },
    { name: 'Spa & Body Care', percentage: 18, color: '#8b5cf6' },
    { name: 'Nails & Pedicure', percentage: 12, color: '#ec4899' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Financial Analytics</h1>
          <p className="text-sm text-slate-500">Business performance, service revenue breakdown, and payment mode metrics.</p>
        </div>
        <button
          onClick={() => alert('Exporting monthly GST & Revenue report to CSV...')}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export GST Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Monthly Total Sales</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{data?.monthlyTotal?.toLocaleString() || '1,80,500'}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Completed Appointments</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{data?.monthlyAppointments || 135} Bookings</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">New Client Acquisitions</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">+{data?.newCustomersThisMonth || 38} Clients</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Avg Ticket / Invoice</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{data?.avgTicketSize || '1,337'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-4">Revenue Share by Category</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={servicePie} dataKey="percentage" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {servicePie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4">Payment Methods Summary</h3>
            <div className="space-y-4">
              {data?.paymentBreakdown?.map((pm: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-sky-500 text-white rounded-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{pm.method}</h4>
                      <p className="text-[11px] text-slate-500">{pm.count} Transactions</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{pm.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
