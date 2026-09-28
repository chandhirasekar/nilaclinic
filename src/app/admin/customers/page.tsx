'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, Award, MessageCircle, X } from 'lucide-react';
import { ICustomer } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    phone: string;
    email: string;
    gender: 'Female' | 'Male' | 'Other';
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    gender: 'Female',
    notes: '',
  });

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        if (data.success) setCustomers(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers([data.data, ...customers]);
        setShowModal(false);
        setNewCustomer({ name: '', phone: '', email: '', gender: 'Female', notes: '' });
      }
    } catch (err) {
      alert('Error creating customer profile');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient & Client CRM</h1>
          <p className="text-sm text-slate-500">Track patient & client profiles, visit history, and loyalty reward points.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:block">
          Total Registered Clients: {customers.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Client Profile</th>
                <th className="px-6 py-3.5">Contact Info</th>
                <th className="px-6 py-3.5">Visits Count</th>
                <th className="px-6 py-3.5">Lifetime Spent</th>
                <th className="px-6 py-3.5">Loyalty Points</th>
                <th className="px-6 py-3.5">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((client) => (
                <tr key={client._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div>{client.name}</div>
                        <div className="text-[11px] font-normal text-slate-400">{client.notes || 'Regular Client'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="flex items-center text-slate-800 font-medium">
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center text-slate-400 text-[11px]">
                        <Mail className="w-3 h-3 mr-1" />
                        {client.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{client.visits} Visits</td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{client.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <Award className="w-3 h-3 mr-1 text-amber-600" />
                      {client.loyaltyPoints} Pts
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Client Profile</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavya Sundaram"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Preferences</label>
                <textarea
                  placeholder="Skin sensitivities, preferred hair products, etc."
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none h-20"
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
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
