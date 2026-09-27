'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Clock, Scissors, Phone, X } from 'lucide-react';
import { IAppointment, IService, IStaff } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceName: 'Hydra Facial & Glowing Treatment',
    stylistName: 'Anitha R.',
    date: '2026-09-27',
    time: '02:00 PM',
    amount: 2499,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, svcRes, stfRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/services'),
          fetch('/api/staff')
        ]);
        const aData = await appRes.json();
        const sData = await svcRes.json();
        const stData = await stfRes.json();
        if (aData.success) setAppointments(aData.data);
        if (sData.success) setServices(sData.data);
        if (stData.success) setStaff(stData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments([data.data, ...appointments]);
        setShowModal(false);
        setFormData({
          customerName: '',
          customerPhone: '',
          serviceName: services[0]?.name || 'Hair Cut & Style',
          stylistName: staff[0]?.name || 'Anitha R.',
          date: '2026-09-27',
          time: '02:00 PM',
          amount: 650,
        });
      }
    } catch (err) {
      alert('Error booking appointment');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesFilter = filterStatus === 'All' || appt.status === filterStatus;
    const matchesQuery = appt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appt.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appt.customerPhone.includes(searchQuery);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-sm text-slate-500">Book, reschedule, and manage salon appointments & stylists.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, service or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {['All', 'Scheduled', 'Confirmed', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appt) => (
          <div key={appt._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 mr-1 text-sky-600" />
                  {appt.time} ({appt.date})
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  appt.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                  'bg-sky-100 text-sky-800'
                }`}>
                  {appt.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{appt.customerName}</h3>
              <p className="text-xs text-slate-500 flex items-center mt-0.5">
                <Phone className="w-3 h-3 mr-1 text-slate-400" />
                {appt.customerPhone}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{appt.serviceName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Stylist:</span>
                  <span className="font-semibold text-slate-800 flex items-center">
                    <Scissors className="w-3 h-3 mr-1 text-sky-500" />
                    {appt.stylistName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total Price:</span>
                  <span className="font-black text-slate-900 text-sm">₹{appt.amount}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => alert(`WhatsApp appointment confirmation reminder sent to ${appt.customerPhone}!`)}
                className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg text-center transition-all"
              >
                WhatsApp Alert
              </button>
              <button
                onClick={() => {
                  const updated = appointments.map(a => a._id === appt._id ? { ...a, status: 'Completed' as const } : a);
                  setAppointments(updated);
                }}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Mark Done
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Book New Salon Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Service *</label>
                <select
                  value={formData.serviceName}
                  onChange={(e) => {
                    const selected = services.find(s => s.name === e.target.value);
                    setFormData({
                      ...formData,
                      serviceName: e.target.value,
                      amount: selected ? selected.price : formData.amount
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {services.map(s => (
                    <option key={s._id} value={s.name}>{s.name} - ₹{s.price} ({s.duration} mins)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Stylist *</label>
                  <select
                    value={formData.stylistName}
                    onChange={(e) => setFormData({ ...formData, stylistName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    {staff.map(st => (
                      <option key={st._id} value={st.name}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="11:30 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
