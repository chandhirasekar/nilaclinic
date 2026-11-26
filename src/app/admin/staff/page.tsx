'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Phone,
  Mail,
  UserCheck,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  Calendar,
  Lock,
  Building2,
  Stethoscope,
  Briefcase,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { IStaff, StaffDesignation } from '@/types';
import { useClinic } from '@/context/ClinicContext';

export default function StaffMasterPage() {
  const { stores, selectedStore, user } = useClinic();
  const [staffList, setStaffList] = useState<IStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [editingStaff, setEditingStaff] = useState<IStaff | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    designation: 'Therapist' as StaffDesignation,
    stores: [selectedStore || 'NILA-TH'],
    calendarColour: '#0284c7',
    showInAppointmentCalendar: true,
    hasLogin: false,
    loginRole: 'Staff' as 'Admin' | 'Staff' | 'Doctor',
    password: '',
  });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/masters/staff?storeCode=${selectedStore}`);
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [selectedStore]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      designation: 'Therapist',
      stores: [selectedStore || 'NILA-TH'],
      calendarColour: '#0284c7',
      showInAppointmentCalendar: true,
      hasLogin: false,
      loginRole: 'Staff',
      password: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (st: IStaff) => {
    setEditingStaff(st);
    setFormData({
      name: st.name,
      mobile: st.mobile,
      email: st.email || '',
      designation: st.designation || 'Therapist',
      stores: st.stores || [selectedStore || 'NILA-TH'],
      calendarColour: st.calendarColour || '#0284c7',
      showInAppointmentCalendar: st.showInAppointmentCalendar !== false,
      hasLogin: st.hasLogin || false,
      loginRole: st.loginRole || 'Staff',
      password: '',
    });
    setShowModal(true);
  };

  const handleStoreToggle = (storeCode: string) => {
    const exists = formData.stores.includes(storeCode);
    if (exists) {
      setFormData({
        ...formData,
        stores: formData.stores.filter(s => s !== storeCode),
      });
    } else {
      setFormData({
        ...formData,
        stores: [...formData.stores, storeCode],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.stores.length === 0) {
      alert('Please assign the staff member to at least one clinic store.');
      return;
    }

    try {
      if (editingStaff) {
        const res = await fetch('/api/masters/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStaff._id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          await loadStaff();
        }
      } else {
        const res = await fetch('/api/masters/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          await loadStaff();
        }
      }
    } catch (err) {
      alert('Failed to save staff record');
    }
  };

  const toggleStaffActive = async (st: IStaff) => {
    try {
      const res = await fetch('/api/masters/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: st._id,
          isActive: !st.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadStaff();
      }
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDeleteStaff = async (st: IStaff) => {
    const isNonDeletableAdmin =
      st.loginRole === 'Admin' ||
      (st.designation as string) === 'Admin' ||
      st.name.toLowerCase().includes('director') ||
      st.name.toLowerCase().includes('mohan') ||
      st.email?.toLowerCase().includes('admin@');

    if (isNonDeletableAdmin) {
      alert('Administrator & Director accounts cannot be deleted.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete staff member "${st.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/masters/staff?id=${encodeURIComponent(st._id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await loadStaff();
      } else {
        alert(data.message || 'Failed to delete staff member');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting staff member');
    }
  };

  const filteredStaff = staffList.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.mobile.includes(searchQuery) ||
      (st.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDesignation =
      designationFilter === 'All' || st.designation === designationFilter;
    return matchesSearch && matchesDesignation;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Specialist Master</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Doctors, Therapists, Front desk, and Managers with branch assignments, calendar color codes, and portal access.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar (FR-17) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, mobile, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Doctor', 'Therapist', 'Front desk', 'Customer care', 'Manager'].map((des) => (
            <button
              key={des}
              onClick={() => setDesignationFilter(des)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                designationFilter === des
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {des}y
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((st) => {
          const isNonDeletableAdmin =
            st.loginRole === 'Admin' ||
            (st.designation as string) === 'Admin' ||
            st.name.toLowerCase().includes('director') ||
            st.name.toLowerCase().includes('mohan') ||
            st.email?.toLowerCase().includes('admin@');

          return (
            <div
              key={st._id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between h-full ${
                st.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-red-200 bg-red-50/20 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block border border-white shadow-xs shrink-0"
                      style={{ backgroundColor: st.calendarColour || '#0284c7' }}
                      title="Calendar Colour"
                    />
                    <span className="text-[11px] font-mono text-slate-400">ID: {st._id.slice(-6)}</span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      st.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {st.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 min-h-[46px]">
                  <div
                    className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 capitalize"
                    style={{ backgroundColor: st.calendarColour || '#0284c7' }}
                  >
                    {st.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate capitalize">{st.name}</h3>
                    <span className="text-xs font-semibold text-slate-500">{st.designation}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 mt-3 pt-3 border-t border-slate-100 min-h-[96px] flex flex-col justify-start">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium">{st.mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium truncate">{st.email || '—'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Calendar View: {st.showInAppointmentCalendar ? 'Visible' : 'Hidden'}</span>
                  </div>
                  {st.hasLogin ? (
                    <div className="pt-0.5">
                      <span className="inline-flex items-center space-x-1 text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>Login Enabled ({st.loginRole || 'Staff'})</span>
                      </span>
                    </div>
                  ) : (
                    <div className="h-5" />
                  )}
                </div>

                {/* Assigned stores tags */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 min-h-[58px] flex flex-col justify-start">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Assigned Stores:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {st.stores && st.stores.length > 0 ? (
                      st.stores.map((sc) => (
                        <span
                          key={sc}
                          className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60"
                        >
                          {sc}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleStaffActive(st)}
                  className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-lg transition-all ${
                    st.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {st.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {user?.role === 'admin' && !isNonDeletableAdmin && (
                    <button
                      onClick={() => handleDeleteStaff(st)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-1"
                      title="Delete Staff Member (Admin only)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-lg mb-1">
              {editingStaff ? 'Edit Staff Member' : 'Register New Staff Member'}
            </h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Enter staff role, store assignments, calendar color, and login access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Varma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 00000"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="staff@nilaclinic.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Therapist">Therapist</option>
                    <option value="Front desk">Front desk</option>
                    <option value="Customer care">Customer care</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calendar Colour</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.calendarColour}
                      onChange={(e) => setFormData({ ...formData, calendarColour: e.target.value })}
                      className="w-9 h-9 p-0 border-0 rounded cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-600">{formData.calendarColour}</span>
                  </div>
                </div>
              </div>

              {/* Stores Multi-Select (FR-08) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Clinic Stores *</label>
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {stores.map((st) => (
                    <label key={st.code} className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.stores.includes(st.code)}
                        onChange={() => handleStoreToggle(st.code)}
                        className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-800">[{st.code}]</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Appointment calendar toggle */}
              <label className="flex items-center space-x-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={formData.showInAppointmentCalendar}
                  onChange={(e) => setFormData({ ...formData, showInAppointmentCalendar: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-800 font-bold">
                  Show as column in Appointment Calendar
                </span>
              </label>

              {/* Login capability toggle (FR-09) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.hasLogin}
                    onChange={(e) => setFormData({ ...formData, hasLogin: e.target.checked })}
                    className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-900 font-bold">Enable System Login for this Staff</span>
                </label>

                {formData.hasLogin && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Login Role</label>
                      <select
                        value={formData.loginRole}
                        onChange={(e) => setFormData({ ...formData, loginRole: e.target.value as any })}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                      >
                        <option value="Staff">Staff</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showStaffPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-2 py-1.5 pr-8 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffPassword(!showStaffPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                          title={showStaffPassword ? 'Hide password' : 'Show password'}
                        >
                          {showStaffPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                  {editingStaff ? 'Save Staff' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
