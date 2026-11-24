'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, User, AlertTriangle, Building2, CreditCard, X, MapPin } from 'lucide-react';
import { ICustomer } from '@/types';
import { useClinic } from '@/context/ClinicContext';

export default function CustomersCRMPage() {
  const { selectedStore, user } = useClinic();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStores, setShowAllStores] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    mobile: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    dob: '',
    email: '',
    area: '',
    allergyNotes: '',
    skinHairNotes: '',
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const storeParam = showAllStores || user?.role === 'admin' && showAllStores ? 'ALL' : selectedStore;
      const res = await fetch(`/api/customers?storeCode=${storeParam}&search=${searchQuery}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [selectedStore, searchQuery, showAllStores]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateError('');

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCustomer,
          firstStoreId: selectedStore,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewCustomer({
          name: '',
          mobile: '',
          gender: 'Female',
          dob: '',
          email: '',
          area: '',
          allergyNotes: '',
          skinHairNotes: '',
        });
        await loadCustomers();
      } else {
        setDuplicateError(data.message || 'Error registering customer');
      }
    } catch (err) {
      setDuplicateError('Failed to register customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patients & Customer CRM</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Unified customer master shared across all clinic branches with instant mobile search and cross-store visit history.
          </p>
        </div>
        <button
          onClick={() => {
            setDuplicateError('');
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Controls & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Mobile (+91), Name, or Customer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
        </div>

        {/* FR-27: Admin view all stores toggle */}
        <div className="flex items-center space-x-3 text-sm">
          {user?.role === 'admin' && (
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAllStores}
                onChange={(e) => setShowAllStores(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-bold text-slate-800">View All Stores</span>
            </label>
          )}

          <span className="text-slate-600 font-medium">
            Total Clients: <strong className="text-slate-900 font-bold">{customers.length}</strong>
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer ID</th>
                <th className="px-5 py-3.5">Client Profile</th>
                <th className="px-5 py-3.5">Contact & Area</th>
                <th className="px-5 py-3.5">Registered Store</th>
                <th className="px-5 py-3.5">Visits / Spent</th>
                <th className="px-5 py-3.5">Clinical Notes</th>
                <th className="px-5 py-3.5 text-right">Quick Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c._id || c.customerId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-900">{c.customerId}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {c.gender} {c.dob ? `• ${c.dob}` : ''}
                    </div>
                  </td>
                  <td className="px-5 py-4 space-y-0.5">
                    <div className="flex items-center text-slate-900 font-semibold text-sm">
                      <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {c.mobile || c.phone}
                    </div>
                    {c.area && (
                      <div className="flex items-center text-slate-500 text-xs font-medium">
                        <MapPin className="w-3 h-3 mr-1" />
                        {c.area}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      {c.firstStoreId || 'NILA-TH'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{c.visits || 0} Visits</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">₹{(c.totalSpent || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-4 text-[11px] text-slate-500 max-w-xs truncate">
                    {c.skinHairNotes || c.allergyNotes || c.notes || 'Regular'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`/admin/pos?customerId=${c.customerId}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-2xs transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Quick Sale</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Inline Modal (FR-22) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-bold text-slate-900 text-base mb-1">Add New Client</h3>
            <p className="text-xs text-slate-500 mb-3">
              One shared record for all stores. Registered under store [{selectedStore}].
            </p>

            {duplicateError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{duplicateError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavya Sundaram"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number (+91) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 00000"
                    value={newCustomer.mobile}
                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={newCustomer.gender}
                    onChange={(e) => setNewCustomer({ ...newCustomer, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newCustomer.dob}
                    onChange={(e) => setNewCustomer({ ...newCustomer, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Area / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Annanagar, Theni"
                  value={newCustomer.area}
                  onChange={(e) => setNewCustomer({ ...newCustomer, area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skin / Hair Notes & Allergies</label>
                <textarea
                  placeholder="e.g. Sensitive skin, allergy to sulfur..."
                  value={newCustomer.skinHairNotes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, skinHairNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-14"
                />
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
                  Save & Select Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
