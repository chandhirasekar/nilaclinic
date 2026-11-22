'use client';

import React, { useState } from 'react';
import { Building2, Plus, Edit2, CheckCircle2, XCircle, Phone, MapPin, Mail, ShieldAlert, Clock } from 'lucide-react';
import { IStore } from '@/types';
import { useClinic } from '@/context/ClinicContext';

export default function StoreMasterPage() {
  const { stores, refreshStores, user, selectedStore, setSelectedStore } = useClinic();
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<IStore | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '33ABCDE1234F1Z5',
    invoicePrefix: '',
    openTime: '09:00 AM',
    closeTime: '08:00 PM',
    weeklyOff: 'None',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user && user.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-3">
        <ShieldAlert className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="font-bold text-sm">Access Denied</h3>
          <p className="text-xs">Only Clinic Administrators have permission to manage store masters (FR-01).</p>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingStore(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      gstin: '33ABCDE1234F1Z5',
      invoicePrefix: '',
      openTime: '09:00 AM',
      closeTime: '08:00 PM',
      weeklyOff: 'None',
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEdit = (st: IStore) => {
    setEditingStore(st);
    setFormData({
      code: st.code,
      name: st.name,
      address: st.address,
      phone: st.phone,
      email: st.email || '',
      gstin: st.gstin || '33ABCDE1234F1Z5',
      invoicePrefix: st.invoicePrefix || `${st.code}-`,
      openTime: st.workingHours?.open || '09:00 AM',
      closeTime: st.workingHours?.close || '08:00 PM',
      weeklyOff: st.workingHours?.weeklyOff || 'None',
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      gstin: formData.gstin,
      invoicePrefix: formData.invoicePrefix || `${formData.code.toUpperCase().trim()}-`,
      workingHours: {
        open: formData.openTime,
        close: formData.closeTime,
        weeklyOff: formData.weeklyOff,
      },
    };

    try {
      if (editingStore) {
        const res = await fetch('/api/stores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess('Store profile updated successfully!');
          await refreshStores();
          setTimeout(() => setShowModal(false), 800);
        } else {
          setError(data.message || 'Failed to update store');
        }
      } else {
        const res = await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess('New store registered successfully!');
          await refreshStores();
          setTimeout(() => setShowModal(false), 800);
        } else {
          setError(data.message || 'Failed to create store');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const toggleStoreStatus = async (st: IStore) => {
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: st.code,
          isActive: !st.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshStores();
      }
    } catch (err) {
      alert('Error updating store status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Multi-Store Master & Branches (M1)</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            FR-01: Admin can add, edit, and disable stores. Each store has an isolated invoice sequence (e.g. NILA-TH-) and operating hours.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Clinic Branch</span>
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stores.map((st) => {
          const isSelected = selectedStore.toUpperCase() === st.code.toUpperCase();
          return (
            <div
              key={st.code}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                      {st.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{st.name}</h3>
                      <span className="text-xs text-slate-500 font-mono font-medium">Invoice Prefix: {st.invoicePrefix || `${st.code}-`}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      st.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {st.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 mt-3 pt-3 border-t border-slate-100 font-medium">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-xs leading-relaxed">{st.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">{st.phone}</span>
                  </div>
                  {st.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs">{st.email}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {st.workingHours?.open || '09:00 AM'} - {st.workingHours?.close || '08:00 PM'} (Off: {st.workingHours?.weeklyOff || 'None'})
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">GSTIN:</strong> {st.gstin || '33ABCDE1234F1Z5'}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">Next Invoice No:</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    {st.invoicePrefix || `${st.code}-`}
                    {st.nextInvoiceNumber || 1001}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between space-x-2">
                <button
                  onClick={() => setSelectedStore(st.code)}
                  className={`text-sm font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? 'Active Selection' : 'Switch Store'}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Edit Store"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStoreStatus(st)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      st.isActive
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                    title={st.isActive ? 'Disable Store' : 'Enable Store'}
                  >
                    {st.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Store */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-black text-slate-900 text-lg mb-1">
              {editingStore ? 'Edit Clinic Store' : 'Register New Clinic Store'}
            </h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Enter branch code, invoice prefix, GSTIN, and operating hours.
            </p>

            {error && <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
            {success && <div className="mb-3 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStore}
                    placeholder="e.g. NILA-CB"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono disabled:opacity-50 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Prefix *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NILA-CB-"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nila Clinic - Coimbatore Branch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address *</label>
                <textarea
                  required
                  placeholder="Street, City, Pin Code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-14 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="33ABCDE1234F1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Open Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Close Time</label>
                  <input
                    type="text"
                    placeholder="08:00 PM"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weekly Off</label>
                  <select
                    value={formData.weeklyOff}
                    onChange={(e) => setFormData({ ...formData, weeklyOff: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-sm font-medium"
                  >
                    <option value="None">None</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-sm"
                >
                  {editingStore ? 'Save Store' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
