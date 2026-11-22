'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, X, CheckCircle2, User, Stethoscope } from 'lucide-react';
import { ICustomerPackage, IStaff } from '@/types';

interface IScheduledSessionItem {
  id: string;
  sessionNumber: number;
  totalSessions: number;
  serviceName: string;
  date: string;
  time: string;
  durationMins: number;
  staffName: string;
  enabled: boolean;
}

interface PackageSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    customerId?: string;
    name: string;
    mobile: string;
  };
  customerPackage: ICustomerPackage;
  staffMembers: IStaff[];
  storeId: string;
  onSuccess?: () => void;
}

export default function PackageSchedulerModal({
  isOpen,
  onClose,
  customer,
  customerPackage,
  staffMembers,
  storeId,
  onSuccess,
}: PackageSchedulerModalProps) {
  const [sessions, setSessions] = useState<IScheduledSessionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Time slot options
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM',
  ];

  // Helper to add days to a date string
  const addDays = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Build remaining session items when modal opens
  useEffect(() => {
    if (!customerPackage) return;
    setSuccessMessage(null);

    const defaultStaff = staffMembers[0]?.name || 'Attending Specialist';
    const items: IScheduledSessionItem[] = [];
    let sessionCounter = (customerPackage.usedSittings || 0) + 1;
    let daysOffset = 7; // schedule weekly by default

    // Flatten each service remaining into individual sessions
    (customerPackage.servicesRemaining || []).forEach((s) => {
      for (let i = 0; i < s.remainingCount; i++) {
        items.push({
          id: `${s.serviceName}-${i}-${Date.now()}`,
          sessionNumber: sessionCounter,
          totalSessions: customerPackage.totalSittings,
          serviceName: s.serviceName,
          date: addDays(daysOffset),
          time: '10:00 AM',
          durationMins: 30,
          staffName: defaultStaff,
          enabled: true,
        });
        sessionCounter++;
        daysOffset += 7; // +7 days for subsequent sessions
      }
    });

    setSessions(items);
  }, [customerPackage, staffMembers]);

  if (!isOpen || !customerPackage) return null;

  const updateSession = (index: number, field: keyof IScheduledSessionItem, val: any) => {
    const updated = [...sessions];
    (updated[index] as any)[field] = val;
    setSessions(updated);
  };

  const handleScheduleAll = async () => {
    const enabledSessions = sessions.filter((s) => s.enabled);
    if (enabledSessions.length === 0) {
      alert('Please select at least one session to schedule.');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      for (const item of enabledSessions) {
        const staffObj = staffMembers.find((st) => st.name === item.staffName);
        const payload = {
          customerId: customer.customerId,
          customerName: customer.name,
          customerPhone: customer.mobile,
          serviceName: item.serviceName,
          staffName: item.staffName,
          staffId: staffObj?._id,
          doctorId: staffObj?.designation === 'Doctor' ? staffObj._id : undefined,
          doctorName: staffObj?.designation === 'Doctor' ? staffObj.name : undefined,
          storeId: storeId || 'NILA-TH',
          date: item.date,
          startTime: item.time,
          durationMins: item.durationMins,
          notes: `[Package: ${customerPackage.packageName}] Session ${item.sessionNumber} of ${item.totalSessions} (Prepaid)`,
          force: true, // override any conflicts to ensure calendar booking
        };

        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        }
      }

      setSuccessMessage(`✓ Successfully scheduled ${successCount} session(s) directly on the Appointment Calendar!`);
      if (onSuccess) onSuccess();
    } catch (e) {
      alert('Error scheduling remaining sessions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Schedule Remaining Package Sessions</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Package: <strong className="text-purple-900">{customerPackage.packageName}</strong> • Client:{' '}
              <strong className="text-slate-800">{customer.name}</strong> ({customer.mobile})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-black text-emerald-900 text-base">{successMessage}</h4>
            <p className="text-xs text-emerald-700">
              All selected remaining sessions have been placed on the specialist appointment calendar.
            </p>
            <div className="pt-2 flex justify-center space-x-3">
              <a
                href="/admin/appointments"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                View Appointment Calendar →
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100/50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Context Info */}
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-purple-900 font-semibold">
                Sessions Progress: <strong>{customerPackage.usedSittings} Completed</strong> •{' '}
                <strong className="text-purple-700">{customerPackage.remainingSittings} Remaining to Schedule</strong>
              </span>
              <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                Prepaid Sessions
              </span>
            </div>

            {/* Sessions Table / List */}
            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
              {sessions.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                    item.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => updateSession(idx, 'enabled', e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-slate-800">
                        Session {item.sessionNumber} of {item.totalSessions}:{' '}
                        <span className="text-purple-800">{item.serviceName}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Prepaid ₹0</span>
                  </div>

                  {item.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Date */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Scheduled Date
                        </label>
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateSession(idx, 'date', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Time Slot</label>
                        <select
                          value={item.time}
                          onChange={(e) => updateSession(idx, 'time', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                        >
                          {timeSlots.map((ts) => (
                            <option key={ts} value={ts}>
                              {ts}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Specialist */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          Assigned Specialist
                        </label>
                        <select
                          value={item.staffName}
                          onChange={(e) => updateSession(idx, 'staffName', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                        >
                          {staffMembers.map((st) => (
                            <option key={st._id} value={st.name}>
                              {st.name} ({st.designation})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || sessions.filter((s) => s.enabled).length === 0}
                onClick={handleScheduleAll}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Booking All Sessions...'
                    : `📅 Set All Remaining (${sessions.filter((s) => s.enabled).length}) on Calendar`}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

