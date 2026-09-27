'use client';

import React, { useState } from 'react';
import { Save, MessageCircle, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const [salonInfo, setSalonInfo] = useState({
    name: 'Bonitaa Salon & Spa',
    branch: 'Theni Main Branch',
    phone: '+91 98765 43210',
    email: 'theni@bonitaa.co.in',
    gstin: '33ABCDE1234F1Z5',
    currency: 'INR (₹)',
    autoWhatsApp: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Salon Settings successfully updated!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Salon Profile & System Settings</h1>
        <p className="text-sm text-slate-500">Configure business information, tax rules, and WhatsApp notifications.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-sky-600 font-bold border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5" />
            <span>Salon Business Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salon Name</label>
              <input
                type="text"
                value={salonInfo.name}
                onChange={(e) => setSalonInfo({ ...salonInfo, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Location</label>
              <input
                type="text"
                value={salonInfo.branch}
                onChange={(e) => setSalonInfo({ ...salonInfo, branch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={salonInfo.phone}
                onChange={(e) => setSalonInfo({ ...salonInfo, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={salonInfo.email}
                onChange={(e) => setSalonInfo({ ...salonInfo, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={salonInfo.gstin}
                onChange={(e) => setSalonInfo({ ...salonInfo, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold border-b border-slate-100 pb-3">
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp & Automation Settings</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200/60">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Automated WhatsApp Appointment Alerts</h4>
              <p className="text-[11px] text-slate-500">Automatically send instant confirmation & reminder messages to clients on booking.</p>
            </div>
            <input
              type="checkbox"
              checked={salonInfo.autoWhatsApp}
              onChange={(e) => setSalonInfo({ ...salonInfo, autoWhatsApp: e.target.checked })}
              className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
