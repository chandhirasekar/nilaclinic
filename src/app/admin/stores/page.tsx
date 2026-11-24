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
          <p className="text-xs">Only Clinic Administrators have permission to manage clinic branch locations.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Clinic Network
            </span>
            <span className="text-xs text-slate-400 font-medium">• Multi-Store Operations</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinic Branches & Locations</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage branch profiles, operating schedules, invoice sequences, and multi-location clinic settings.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Clinic Branch</span>
        </button>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Branches</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{stores.length} Clinics</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Active Locations</div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">
            {stores.filter((s) => s.isActive).length} Operational
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Currently Selected Branch</div>
          <div className="text-base font-bold text-slate-900 truncate mt-1 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">{stores.find((s) => s.code === selectedStore)?.name || selectedStore}</span>
            <span className="text-xs font-mono text-slate-400 font-normal">[{selectedStore}]</span>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stores.map((st) => {
          const isSelected = selectedStore.toUpperCase() === st.code.toUpperCase();
          return (
            <div
              key={st.code}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/5'
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-3.5">
                {/* Branch Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-600/20 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200/80 tracking-wide">
                          {st.code}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug tracking-tight mt-1">
                        {st.name}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      st.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${st.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {st.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 leading-relaxed font-medium">{st.address}</span>
                </div>

                {/* Contacts Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700 font-medium truncate bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700 font-medium truncate bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.email || '—'}</span>
                  </div>
                </div>

                {/* Operating Hours & Tax Information */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-800">
                        {st.workingHours?.open || '09:00 AM'} – {st.workingHours?.close || '08:00 PM'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Off: {st.workingHours?.weeklyOff || 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500 font-medium">
                      GSTIN: <span className="font-mono text-slate-700 font-semibold">{st.gstin || '33ABCDE1234F1Z5'}</span>
                    </span>
                    <span className="text-slate-500 font-medium">
                      Prefix: <span className="font-mono text-slate-700 font-semibold">{st.invoicePrefix || `${st.code}-`}</span>
                    </span>
                  </div>
                </div>

                {/* Next Invoice Counter Card */}
                <div className="p-3 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                      Next Invoice Number
                    </div>
                    <div className="text-xs text-emerald-700/80 font-medium">Auto-incrementing billing sequence</div>
                  </div>
                  <span className="font-mono font-black text-emerald-800 text-sm sm:text-base bg-white px-3 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                    {st.invoicePrefix || `${st.code}-`}
                    {st.nextInvoiceNumber || 1001}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between space-x-2">
                {isSelected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active Selection</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedStore(st.code)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs hover:shadow cursor-pointer"
                  >
                    Switch to Branch
                  </button>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-colors border border-transparent hover:border-sky-200 cursor-pointer"
                    title="Edit Store Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStoreStatus(st)}
                    className={`p-2 rounded-xl transition-colors border border-transparent cursor-pointer ${
                      st.isActive
                        ? 'text-rose-500 hover:bg-rose-50 hover:border-rose-200'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                    }`}
                    title={st.isActive ? 'Disable Branch' : 'Enable Branch'}
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
