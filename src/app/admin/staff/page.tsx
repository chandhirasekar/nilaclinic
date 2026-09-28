'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Phone, X } from 'lucide-react';
import { IStaff } from '@/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newStaff, setNewStaff] = useState<{
    name: string;
    role: string;
    phone: string;
    commissionRate: number;
  }>({
    name: '',
    role: 'Senior Hair & Skin Specialist',
    phone: '',
    commissionRate: 12,
  });

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch('/api/staff');
        const data = await res.json();
        if (data.success) setStaff(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      });
      const data = await res.json();
      if (data.success) {
        setStaff([...staff, data.data]);
        setShowModal(false);
        setNewStaff({ name: '', role: 'Senior Hair & Skin Specialist', phone: '', commissionRate: 12 });
      }
    } catch (err) {
      alert('Error adding staff member');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff & Specialist Management</h1>
          <p className="text-sm text-slate-500">Track clinic staff rosters, daily shifts, and calculated sales commission rates.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Specialist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staff.map((st) => (
          <div key={st._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  {st.name.charAt(0)}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  st.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                  st.status === 'Busy' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {st.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{st.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{st.role}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {st.phone}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Commission Rate:</span>
                <span className="font-bold text-sky-600">{st.commissionRate}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Revenue Generated:</span>
                <span className="font-black text-slate-900">₹{st.revenueGenerated?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Register New Specialist / Staff</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anitha Ramachandran"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Dermatologist & Hair Specialist"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98400 00000"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission %</label>
                  <input
                    type="number"
                    value={newStaff.commissionRate}
                    onChange={(e) => setNewStaff({ ...newStaff, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
