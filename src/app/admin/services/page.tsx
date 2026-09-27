'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Clock, X } from 'lucide-react';
import { IService } from '@/types';

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newService, setNewService] = useState({
    name: '',
    category: 'Hair',
    duration: 45,
    price: 999,
    description: '',
  });

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) setServices(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (data.success) {
        setServices([...services, data.data]);
        setShowModal(false);
        setNewService({ name: '', category: 'Hair', duration: 45, price: 999, description: '' });
      }
    } catch (err) {
      alert('Error adding service');
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Catalog & Rates</h1>
          <p className="text-sm text-slate-500">Configure salon treatment packages, durations, and pricing tier.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((svc) => (
          <div key={svc._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                  {svc.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {svc.duration} Mins
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{svc.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{svc.description || 'Professional salon care treatment.'}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Rate</span>
                <span className="text-lg font-black text-slate-900">₹{svc.price}</span>
              </div>
              <button
                onClick={() => alert(`Service "${svc.name}" selected for quick edit`)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Edit Price
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Treatment Service</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keratin Smoothening Spa"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Skin">Skin</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Spa">Spa</option>
                    <option value="Nails">Nails</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Service details and included treatment benefits..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none h-16"
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
