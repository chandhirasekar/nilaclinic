'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Building2,
  Receipt,
  CreditCard,
  ShieldCheck,
  Mail,
  Sliders,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { IClinicSettings, IPaymentMode } from '@/types';
import { useClinic } from '@/context/ClinicContext';

export default function SettingsMasterPage() {
  const { user } = useClinic();
  const [settings, setSettings] = useState<IClinicSettings | null>(null);
  const [paymentModes, setPaymentModes] = useState<IPaymentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModeName, setNewModeName] = useState('');
  const [newModeType, setNewModeType] = useState<'cash' | 'non-cash'>('non-cash');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettingsAndModes = async () => {
    setLoading(true);
    try {
      const [setRes, pmRes] = await Promise.all([
        fetch('/api/masters/settings'),
        fetch('/api/masters/payment-modes'),
      ]);
      const setData = await setRes.json();
      const pmData = await pmRes.json();
      if (setData.success) setSettings(setData.data);
      if (pmData.success) setPaymentModes(pmData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndModes();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/masters/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleAddPaymentMode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModeName.trim()) return;

    try {
      const res = await fetch('/api/masters/payment-modes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModeName.trim(),
          type: newModeType,
          displayOrder: paymentModes.length + 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewModeName('');
        await loadSettingsAndModes();
      }
    } catch (err) {
      alert('Failed to add payment mode');
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Clinic Masters & Settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Clinic Masters & System Rules (M2)</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            FR-13 to FR-16: Payment modes, bill print rules, discount thresholds, and cross-store policies.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings updated successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Business Profile & Billing Formats (FR-14) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700 font-black border-b border-slate-100 pb-3 text-base">
            <Building2 className="w-5 h-5" />
            <span>Clinic Identity & Bill Format Settings (FR-14)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Clinic Name</label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Official GSTIN Number</label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Headquarters Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Primary Bill Print Format</label>
              <select
                value={settings.printSize}
                onChange={(e) => setSettings({ ...settings, printSize: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="80mm">80 mm Thermal POS Receipt</option>
                <option value="A4">A4 Full Sheet Formal Invoice</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Bill Footer Message</label>
              <input
                type="text"
                value={settings.billFooter}
                onChange={(e) => setSettings({ ...settings, billFooter: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical & Billing Rules (FR-15 & FR-16) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-sky-700 font-black border-b border-slate-100 pb-3 text-base">
            <Sliders className="w-5 h-5" />
            <span>Clinical Rules & Cross-Store Settings (FR-15 & FR-16)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Maximum Staff Discount Allowed (%)
              </label>
              <input
                type="number"
                value={settings.maxStaffDiscountPercent}
                onChange={(e) => setSettings({ ...settings, maxStaffDiscountPercent: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">Staff cannot discount above this %; Admin can.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Appointment Slot Interval (Mins)</label>
              <input
                type="number"
                value={settings.slotInterval}
                onChange={(e) => setSettings({ ...settings, slotInterval: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <span className="text-xs text-slate-500 mt-0.5 block font-medium">Default: 15 minutes.</span>
            </div>

            {/* Checkbox Toggles */}
            <div className="sm:col-span-2 space-y-3 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gstOnBills}
                  onChange={(e) => setSettings({ ...settings, gstOnBills: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Enable GST breakdown calculation on Bills (Off by default in BRD v3.0)
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.staffCanEditPrice}
                  onChange={(e) => setSettings({ ...settings, staffCanEditPrice: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Allow Staff to manually edit item price in Quick Sale
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.packageUseInOtherStores}
                  onChange={(e) => setSettings({ ...settings, packageUseInOtherStores: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Allow packages bought at Store A to be redeemed at Store B (Cross-Store packages)
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sharingOfCaseNotes}
                  onChange={(e) => setSettings({ ...settings, sharingOfCaseNotes: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Share clinical case notes between doctors across different clinic stores
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.staffCanExport}
                  onChange={(e) => setSettings({ ...settings, staffCanExport: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Allow Staff role to export reports to Excel / CSV (Module 9 Permission Rule)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2.5: End-of-Day Sales Email Settings (Module 10 / FR-94 to FR-100) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-indigo-700 font-black text-base">
              <Mail className="w-5 h-5" />
              <span>End-of-Day Executive Sales Email (Module 10)</span>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">Automated Cron Dispatch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="sm:col-span-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.endOfDayEmail?.enabled || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      endOfDayEmail: {
                        ...(settings.endOfDayEmail || {
                          recipients: ['admin@nilaclinic.com'],
                          sendTime: '21:30',
                          format: 'combined',
                          attachExcel: true,
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-800">
                  Enable Daily Automated Sales Email to Clinic Owners / Management
                </span>
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Recipients (Comma-separated)</label>
              <input
                type="text"
                placeholder="admin@nilaclinic.com, doctor@nilaclinic.com"
                value={(settings.endOfDayEmail?.recipients || []).join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    endOfDayEmail: {
                      ...(settings.endOfDayEmail || {
                        enabled: false,
                        sendTime: '21:30',
                        format: 'combined',
                        attachExcel: true,
                      }),
                      recipients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Send Time (IST)</label>
                <input
                  type="time"
                  value={settings.endOfDayEmail?.sendTime || '21:30'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      endOfDayEmail: {
                        ...(settings.endOfDayEmail || {
                          enabled: false,
                          recipients: ['admin@nilaclinic.com'],
                          format: 'combined',
                          attachExcel: true,
                        }),
                        sendTime: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Report Format</label>
                <select
                  value={settings.endOfDayEmail?.format || 'combined'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      endOfDayEmail: {
                        ...(settings.endOfDayEmail || {
                          enabled: false,
                          recipients: ['admin@nilaclinic.com'],
                          sendTime: '21:30',
                          attachExcel: true,
                        }),
                        format: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="combined">All Stores Combined</option>
                  <option value="per-store">Separate per Store</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-600 font-medium">
              Covers gross sales, discounts, net collections, payment mode split, bills count, and appointments.
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/reports/daily-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isTest: true }),
                  });
                  const d = await res.json();
                  if (d.success) {
                    alert(`Test Email Dispatched Successfully!\nRecipients: ${d.recipients?.join(', ')}\nNet Sales: ₹${d.summary?.totalNetSales}\nBills Settled: ${d.summary?.totalBills}`);
                  } else {
                    alert(d.message || 'Error triggering test email');
                  }
                } catch (err) {
                  alert('Failed to send test email');
                }
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs sm:text-sm border border-indigo-200 transition"
            >
              Send Test Email Now
            </button>
          </div>
        </div>

        {/* Section 3: Payment Modes Master (FR-13) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-purple-700 font-black border-b border-slate-100 pb-3 text-base">
            <CreditCard className="w-5 h-5" />
            <span>Payment Modes Master (FR-13)</span>
          </div>

          <p className="text-sm text-slate-600 font-medium">
            Only cash mode gives change; non-cash modes never give change. Custom payment modes can be added.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {paymentModes.map((pm) => (
              <div key={pm.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">{pm.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${pm.type === 'cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {pm.type}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium mt-1 block">
                  {pm.type === 'cash' ? 'Gives Cash Change' : 'No Change'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="New payment mode (e.g. Bajaj Finserv)"
              value={newModeName}
              onChange={(e) => setNewModeName(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none w-64"
            />
            <select
              value={newModeType}
              onChange={(e) => setNewModeType(e.target.value as any)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            >
              <option value="non-cash">Non-Cash</option>
              <option value="cash">Cash</option>
            </select>
            <button
              type="button"
              onClick={handleAddPaymentMode}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-xs"
            >
              Add Mode
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration & Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
}
