'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, ShieldAlert, CheckCircle, XCircle, X, Phone, Mail, Stethoscope, Briefcase, Search, Building2, Filter, Eye, EyeOff, Upload } from 'lucide-react';
import { IUser, IStore } from '@/types';
import { useClinic } from '@/context/ClinicContext';
import { useInfiniteSlice } from '@/hooks/useInfiniteScroll';
import InfiniteScrollSentinel from '@/components/ui/InfiniteScrollSentinel';

export default function UsersManagementPage() {
  const { user, stores, selectedStore } = useClinic();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  // Filters
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'doctor' as 'admin' | 'staff' | 'doctor',
    specialization: '',
    image: '',
    qualification: '',
    experience: '',
    regNo: '',
    focus: '',
    assignedStoreIds: [] as string[],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const storeParam = branchFilter && branchFilter !== 'ALL' ? `?storeCode=${branchFilter}` : '?storeCode=ALL';
      const res = await fetch(`/api/users${storeParam}`);
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
  }, [branchFilter]);

  if (user && user.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center space-x-3">
        <ShieldAlert className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="font-bold text-sm">Access Denied</h3>
          <p className="text-xs">Only Clinic Administrators can manage users and branch store assignments.</p>
        </div>
      </div>
    );
  }

  const handleDoctorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, image: compressed }));
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    const defaultBranch = branchFilter && branchFilter !== 'ALL'
      ? branchFilter
      : (selectedStore && selectedStore !== 'ALL' ? selectedStore : 'NILA-TH');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'doctor',
      specialization: '',
      image: '',
      qualification: '',
      experience: '',
      regNo: '',
      focus: '',
      assignedStoreIds: [defaultBranch],
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
      image: u.image || '',
      qualification: (u as any).qualification || '',
      experience: (u as any).experience || '',
      regNo: (u as any).regNo || '',
      focus: (u as any).focus || '',
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
          setSuccess('Doctor / User created successfully!');
          // Switch to ALL so newly created user is guaranteed visible regardless of store filter
          if (branchFilter !== 'ALL' && !formData.assignedStoreIds.includes(branchFilter)) {
            setBranchFilter('ALL');
          } else {
            await loadUsers();
          }
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery) ||
      (u.specialization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const {
    visibleItems: visibleUsers,
    hasMore: hasMoreUsers,
    loadMore: loadMoreUsers,
    visibleCount: visibleUserCount,
    totalCount: totalUserCount,
  } = useInfiniteSlice(filteredUsers, 10, `${branchFilter}|${roleFilter}|${searchQuery}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Accounts & Store Assignment</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage user logins, access roles, clinic branch permissions, and doctor portal credentials.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor / Staff</span>
        </button>
      </div>

      {/* Search and Branch/Role Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user by name, email, phone, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'doctor', 'staff', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  roleFilter.toLowerCase() === r.toLowerCase()
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'All' ? `All Roles (${users.length})` : `${r}s (${users.filter(u => u.role === r).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Branch Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-500 whitespace-nowrap mr-1 flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            Branch Filter:
          </span>
          <button
            onClick={() => setBranchFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
              branchFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Clinic Branches
          </button>
          {stores.map((st) => (
            <button
              key={st.code}
              onClick={() => setBranchFilter(st.code)}
              className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                branchFilter === st.code
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              [{st.code}] {st.name.replace('Nila Clinic - ', '').replace('Nila Clinic ', '')}
            </button>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No users found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No doctors or staff match the current search or branch filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleUsers.map((u) => {
          return (
            <div
              key={u._id || u.email}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                u.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-red-200 bg-red-50/20 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'doctor'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {u.role === 'doctor' ? <Stethoscope className="w-3.5 h-3.5 mr-1" /> : <Briefcase className="w-3.5 h-3.5 mr-1" />}
                    <span>{u.role}</span>
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-2">
                  {u.image ? (
                    <img
                      src={u.image}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-base flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{u.name}</h3>
                    {u.specialization ? (
                      <p className="text-sm text-emerald-800 font-bold mt-0.5 truncate">{u.specialization}</p>
                    ) : (
                      <p className="text-xs text-slate-500 capitalize">{u.role}</p>
                    )}
                  </div>
                </div>
                {(u as any).qualification && (
                  <p className="text-xs text-slate-500 font-medium mb-1 truncate">{(u as any).qualification}</p>
                )}

                <div className="space-y-1.5 text-xs text-slate-700 mt-3 pt-3 border-t border-slate-100 font-medium">
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
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">
                    Assigned Clinic Stores:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {u.assignedStoreIds && u.assignedStoreIds.length > 0 ? (
                      u.assignedStoreIds.map((stCode) => (
                        <span
                          key={stCode}
                          className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-md"
                        >
                          {stCode}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-medium text-red-500">No store assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleUserActive(u)}
                  className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
                    u.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {u.isActive ? 'Deactivate User' : 'Activate User'}
                </button>

                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center space-x-1 text-xs sm:text-sm font-bold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
      <InfiniteScrollSentinel
        hasMore={hasMoreUsers}
        onLoadMore={loadMoreUsers}
        visibleCount={visibleUserCount}
        totalCount={totalUserCount}
        itemLabel="users"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 p-5 sm:p-7 relative my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingUser ? 'Edit User Account' : 'Register New User'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Set role, credentials, and clinic branch store assignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold shrink-0">{error}</div>}
            {success && <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold shrink-0">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm overflow-y-auto pr-1 grow">
              {/* Doctor / Profile Photo Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {formData.image ? (
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs shrink-0 group">
                      <img src={formData.image} alt={formData.name || 'Preview'} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <Upload className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-semibold">No Photo</span>
                    </div>
                  )}
                  <div>
                    <span className="block font-bold text-slate-800 text-sm">Doctor / Staff Photo</span>
                    <p className="text-[11px] text-slate-500">Auto-compressed for fast website & card display.</p>
                  </div>
                </div>
                <div>
                  <label className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-slate-300 shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formData.image ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleDoctorImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* 3 Columns: Credentials (Full Name, Email, Password) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Varma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    placeholder="doctor@nilaclinic.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-60 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingUser ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Columns: Role, Phone, Specialization */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-sm font-medium"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff (Frontdesk / Billing)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialization / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Dermatologist"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {formData.role === 'doctor' && (
                <>
                  {/* 3 Columns: Qualifications, Experience, Reg No */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                      <input
                        type="text"
                        placeholder="e.g. MBBS, MD - Dermatology"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 10+ Years Experience"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Medical Reg. No</label>
                      <input
                        type="text"
                        placeholder="e.g. TNMC-84920"
                        value={formData.regNo}
                        onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Clinical Focus / Specialties</label>
                    <input
                      type="text"
                      placeholder="e.g. Laser Treatments, Hair Loss Therapies, Acne Protocol"
                      value={formData.focus}
                      onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                    />
                  </div>
                </>
              )}

              {/* Assign Stores Multi-select in THREE COLUMNS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">
                    Assign to Store Branches * (Check all that apply)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.assignedStoreIds.length === stores.length) {
                        setFormData({ ...formData, assignedStoreIds: [] });
                      } else {
                        setFormData({ ...formData, assignedStoreIds: stores.map((s) => s.code) });
                      }
                    }}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    {formData.assignedStoreIds.length === stores.length ? 'Clear All' : 'Select All Branches'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  {stores.map((st) => {
                    const checked = formData.assignedStoreIds.includes(st.code);
                    return (
                      <label
                        key={st.code}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleStoreToggle(st.code)}
                          className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs truncate" title={st.name}>
                          <strong className="text-emerald-700 mr-1">[{st.code}]</strong>
                          {st.name.replace('Nila Clinic - ', '').replace('Nila Clinic ', '')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 shrink-0">
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
