'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, ShieldAlert, CheckCircle, XCircle, Phone, Mail, Stethoscope, Briefcase } from 'lucide-react';
import { IUser, IStore } from '@/types';
import { useClinic } from '@/context/ClinicContext';

export default function UsersManagementPage() {
  const { user, stores, selectedStore } = useClinic();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'doctor' as 'admin' | 'staff' | 'doctor',
    specialization: '',
    assignedStoreIds: [] as string[],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?storeCode=${selectedStore}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedStore]);

  if (user && user.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-3">
        <ShieldAlert className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="font-bold text-sm">Access Denied</h3>
          <p className="text-xs">Only Clinic Administrators can manage users and store assignments (FR-06, FR-07).</p>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'doctor',
      specialization: '',
      assignedStoreIds: [selectedStore || 'THN'],
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenEdit = (u: IUser) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      phone: u.phone || '',
      role: u.role,
      specialization: u.specialization || '',
      assignedStoreIds: u.assignedStoreIds || [],
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleStoreToggle = (storeCode: string) => {
    const exists = formData.assignedStoreIds.includes(storeCode);
    if (exists) {
      setFormData({
        ...formData,
        assignedStoreIds: formData.assignedStoreIds.filter(c => c !== storeCode),
      });
    } else {
      setFormData({
        ...formData,
        assignedStoreIds: [...formData.assignedStoreIds, storeCode],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.assignedStoreIds.length === 0) {
      setError('Please assign the user to at least one clinic store.');
      return;
    }

    try {
      if (editingUser) {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser._id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess('User updated successfully!');
          await loadUsers();
          setTimeout(() => setShowModal(false), 700);
        } else {
          setError(data.message || 'Failed to update user');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess('User account created successfully!');
          await loadUsers();
          setTimeout(() => setShowModal(false), 700);
        } else {
          setError(data.message || 'Failed to create user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const toggleUserActive = async (u: IUser) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: u._id,
          isActive: !u.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadUsers();
      }
    } catch (err) {
      alert('Error updating user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Accounts & Store Assignment</h1>
          <p className="text-xs text-slate-500 mt-1">
            FR-06 & FR-07: Create Doctors & Staff, assign stores, and deactivate users (BR-06: deactivated users cannot log in).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor / Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          return (
            <div
              key={u._id || u.email}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                u.isActive ? 'border-slate-200' : 'border-red-200 bg-red-50/20 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'doctor'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {u.role === 'doctor' ? <Stethoscope className="w-3 h-3 mr-1" /> : <Briefcase className="w-3 h-3 mr-1" />}
                    <span>{u.role}</span>
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{u.name}</h3>
                {u.specialization && (
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">{u.specialization}</p>
                )}

                <div className="space-y-1 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Stores Tags */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Assigned Clinic Stores:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {u.assignedStoreIds && u.assignedStoreIds.length > 0 ? (
                      u.assignedStoreIds.map((stCode) => (
                        <span
                          key={stCode}
                          className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md"
                        >
                          {stCode}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-red-500">No store assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleUserActive(u)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    u.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {u.isActive ? 'Deactivate User' : 'Activate User'}
                </button>

                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center space-x-1 text-xs font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              {editingUser ? 'Edit User Account' : 'Register New User'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set role, credentials, and store branch assignment.
            </p>

            {error && <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs">{error}</div>}
            {success && <div className="mb-3 p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Varma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    placeholder="doctor@nilaclinic.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editingUser ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff (Frontdesk / Billing)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {formData.role === 'doctor' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Dermatologist"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}

              {/* Assign Stores Multi-select (FR-07) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Assign to Store Branches * (Check all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {stores.map((st) => {
                    const checked = formData.assignedStoreIds.includes(st.code);
                    return (
                      <label key={st.code} className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleStoreToggle(st.code)}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-semibold text-slate-800">
                          [{st.code}] {st.name.replace('Nila Clinic - ', '')}
                        </span>
                      </label>
                    );
                  })}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {editingUser ? 'Save User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
