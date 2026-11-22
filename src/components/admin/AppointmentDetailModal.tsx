'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Printer,
  Edit3,
  Calendar,
  Clock,
  Sparkles,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { IAppointment, IStaff } from '@/types';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: IAppointment | null;
  staffMembers?: IStaff[];
  onAppointmentUpdated?: () => void;
  onCancelAppointment?: (appt: IAppointment) => void;
}

// Helper to calculate end time given a start time string (e.g. "10:15 AM") and duration in minutes
export function calculateEndTime(startTimeStr: string, durationMins: number = 30): string {
  if (!startTimeStr) return '';
  const match = startTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return startTimeStr;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const totalMins = hours * 60 + minutes + (durationMins || 30);
  const endHours24 = Math.floor(totalMins / 60) % 24;
  const endMins = totalMins % 60;

  const endH12 = endHours24 > 12 ? endHours24 - 12 : endHours24 === 0 ? 12 : endHours24;
  const endAmPm = endHours24 >= 12 ? 'PM' : 'AM';
  return `${endH12.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')} ${endAmPm}`;
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  staffMembers = [],
  onAppointmentUpdated,
  onCancelAppointment,
}: AppointmentDetailModalProps) {
  const router = useRouter();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState(30);
  const [editStaff, setEditStaff] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Sync state when entering edit mode
  const handleStartEdit = () => {
    if (!appointment) return;
    setEditDate(appointment.date || new Date().toISOString().split('T')[0]);
    setEditTime(appointment.startTime || appointment.time || '10:15 AM');
    setEditDuration(appointment.durationMins || 30);
    setEditStaff(appointment.staffName || appointment.doctorName || '');
    setEditNotes(appointment.notes || '');
    setIsEditing(true);
  };

  if (!isOpen || !appointment) return null;

  const startTime = appointment.startTime || appointment.time || '10:15 AM';
  const duration = appointment.durationMins || 30;
  const endTime = calculateEndTime(startTime, duration);
  const stylistOrDoctor = appointment.staffName || appointment.doctorName || appointment.stylistName || 'Attending Specialist';

  // Format created date
  const createdDateStr = appointment.createdAt
    ? new Date(appointment.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : `${appointment.date || 'Today'} 10:00`;

  // Status mapping matching MioSalon colors
  const statusOptions = [
    { label: 'New in-app booking', value: 'Booked', color: '#3b82f6' }, // Blue
    { label: 'New online booking', value: 'Scheduled', color: '#a855f7' }, // Purple
    { label: 'Arrived', value: 'Arrived', color: '#eab308' }, // Yellow
    { label: 'Started', value: 'In consultation', color: '#22c55e' }, // Green
    { label: 'No show', value: 'No-show', color: '#f97316' }, // Orange
    { label: 'Completed', value: 'Completed', color: '#8b5cf6' }, // Violet
  ];

  // Update appointment status directly
  const handleStatusChange = async (newStatus: string) => {
    if (!appointment) return;
    setIsUpdatingStatus(true);
    try {
      const isCheckIn = newStatus === 'Arrived';
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointment._id || appointment.appointmentId,
          status: newStatus,
          action: isCheckIn ? 'check-in' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (onAppointmentUpdated) onAppointmentUpdated();
        onClose();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save edits (time, duration, staff, notes)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    setIsSavingEdit(true);
    try {
      const staffObj = staffMembers.find((s) => s.name === editStaff);
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointment._id || appointment.appointmentId,
          date: editDate,
          startTime: editTime,
          durationMins: Number(editDuration),
          staffName: editStaff,
          staffId: staffObj?._id,
          doctorId: staffObj?.designation === 'Doctor' ? staffObj._id : undefined,
          doctorName: staffObj?.designation === 'Doctor' ? staffObj.name : undefined,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        if (onAppointmentUpdated) onAppointmentUpdated();
        onClose();
      } else {
        alert(data.message || 'Failed to save appointment changes');
      }
    } catch (err) {
      alert('Error saving changes');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Raise Sale: redirect to POS with customer & service
  const handleRaiseSale = () => {
    const params = new URLSearchParams();
    if (appointment.customerPhone) params.set('mobile', appointment.customerPhone);
    if (appointment.customerId) params.set('customerId', appointment.customerId);
    if (appointment.serviceName) params.set('serviceName', appointment.serviceName);
    if (appointment.amount) params.set('amount', String(appointment.amount));
    if (appointment.staffName) params.set('staffName', appointment.staffName);
    router.push(`/admin/pos?${params.toString()}`);
    onClose();
  };

  // Print appointment slip
  const handlePrintSlip = () => {
    const printContent = `
      <html>
        <head>
          <title>Appointment Slip - ${appointment.customerName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; font-size: 13px; color: #1e293b; max-width: 320px; margin: 0 auto; }
            h2 { font-size: 16px; margin: 0 0 4px 0; text-align: center; }
            p { margin: 3px 0; }
            .header { text-align: center; border-bottom: 1px dashed #94a3b8; padding-bottom: 10px; margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .footer { border-top: 1px dashed #94a3b8; padding-top: 10px; margin-top: 12px; text-align: center; font-size: 11px; color: #64748b; }
            .badge { font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>NILA CLINIC</h2>
            <p>Skin & Hair Care Center</p>
            <p style="font-size: 11px; color: #64748b;">Appointment Slip</p>
          </div>
          <div class="row"><strong>Client:</strong> <span>${appointment.customerName}</span></div>
          <div class="row"><strong>Phone:</strong> <span>${appointment.customerPhone}</span></div>
          <div class="row"><strong>Date:</strong> <span>${appointment.date}</span></div>
          <div class="row"><strong>Time:</strong> <span class="badge">${startTime} - ${endTime}</span></div>
          <div class="row"><strong>Duration:</strong> <span>${duration} Mins</span></div>
          <div class="row"><strong>Service:</strong> <span>${appointment.serviceName}</span></div>
          <div class="row"><strong>Specialist:</strong> <span>${stylistOrDoctor}</span></div>
          <div class="row"><strong>Est. Price:</strong> <span>₹${(appointment.amount || 0).toLocaleString('en-IN')}.00</span></div>
          <div class="footer">
            <p>Please arrive 10 minutes before your slot.</p>
            <p>Thank you for choosing Nila Clinic!</p>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header (MioSalon Style: Centered Customer Name & Phone) */}
        <div className="relative px-6 py-4 border-b border-slate-100 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-wide uppercase">
              {appointment.customerName} ({appointment.customerPhone})
            </h3>
            {appointment.customerId && (
              <span className="text-[11px] font-mono font-semibold text-slate-400">
                ID: {appointment.customerId}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isEditing ? (
          /* Inline Edit Form */
          <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
            <div className="font-bold text-slate-800 text-sm pb-1 border-b border-slate-100">
              Edit Appointment Schedule
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">Start Time</label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                >
                  {/* 15-minute slot options matching MioSalon */}
                  {[
                    '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
                    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
                    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
                    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
                    '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
                    '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
                    '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
                    '04:00 PM', '04:15 PM', '04:30 PM', '04:45 PM',
                    '05:00 PM', '05:15 PM', '05:30 PM', '05:45 PM',
                    '06:00 PM', '06:15 PM', '06:30 PM', '06:45 PM',
                    '07:00 PM', '07:15 PM', '07:30 PM', '07:45 PM',
                    '08:00 PM'
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Duration (Mins)</label>
                <select
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value={15}>15 Mins</option>
                  <option value={30}>30 Mins (Standard)</option>
                  <option value={45}>45 Mins</option>
                  <option value={60}>60 Mins (1 Hour)</option>
                  <option value={90}>90 Mins</option>
                  <option value={120}>120 Mins (2 Hours)</option>
                </select>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">
                  Ends at: {calculateEndTime(editTime, editDuration)}
                </p>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Attending Specialist</label>
                <select
                  value={editStaff}
                  onChange={(e) => setEditStaff(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {staffMembers.map((st) => (
                    <option key={st._id} value={st.name}>
                      {st.name} ({st.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Booking Notes</label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add special instructions or notes..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* Main Two-Column View (Exactly matching MioSalon Layout) */
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
            {/* Left Column (Key Details Table) */}
            <div className="md:col-span-8 space-y-2.5">
              <div className="divide-y divide-slate-100 text-slate-700 font-medium">
                <div className="py-1 flex items-start">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Service Name</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900 uppercase">{appointment.serviceName}</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Service Price</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900">
                    ₹{(appointment.amount || 0).toLocaleString('en-IN')}.00
                  </span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Time</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {startTime} - {endTime}
                  </span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Service Duration</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-semibold text-slate-800">{duration} Mins</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Stylist</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-semibold text-slate-800">{stylistOrDoctor}</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Resource</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="text-slate-500">-Nil-</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Booking Type</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-semibold text-slate-800">
                    {appointment.notes?.includes('Online') ? 'Online Booking' : 'Walk-In'}
                  </span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Payment Status</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span
                    className={`font-bold ${
                      appointment.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {appointment.status === 'Completed' ? 'Paid' : 'Not-Paid'}
                  </span>
                </div>

                <div className="py-1 flex items-start">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Booking Note</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="text-slate-600 italic">
                    {appointment.notes ? appointment.notes : '-Nil-'}
                  </span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Created Date</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-mono text-slate-600">{createdDateStr}</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Created By</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="text-slate-700 font-semibold">Branch Login</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Address</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="text-slate-500">-Nil-</span>
                </div>

                <div className="py-1 flex items-center">
                  <span className="w-36 text-slate-500 font-bold shrink-0">Customer Note</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="text-slate-500">-Nil-</span>
                </div>
              </div>
            </div>

            {/* Right Column (Status Buttons & Print) */}
            <div className="md:col-span-4 flex flex-col justify-between border-l border-slate-100 pl-0 md:pl-6 space-y-4">
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Update Status
                </div>
                {statusOptions.map((st) => {
                  const isActive = appointment.status === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(st.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition border text-left ${
                        isActive
                          ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded shrink-0"
                        style={{ backgroundColor: st.color }}
                      />
                      <span className="flex-1 truncate">{st.label}</span>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Print Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs flex items-center justify-center space-x-2 transition shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions (Cancel, Freeze, Edit, Raise Sale) */}
        {!isEditing && (
          <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Left: Cancel Appointment */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (onCancelAppointment) {
                    onCancelAppointment(appointment);
                    onClose();
                  } else {
                    const reason = prompt('Enter cancellation reason:');
                    if (reason) {
                      handleStatusChange('Cancelled');
                    }
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-2xs"
              >
                Cancel Appointment
              </button>
            </div>

            {/* Right: Freeze, Edit, Raise Sale */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => alert('Appointment schedule frozen for modifications.')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition"
              >
                Freeze
              </button>

              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Edit</span>
              </button>

              {/* Raise Sale Button (MioSalon's signature POS billing jump) */}
              <button
                type="button"
                onClick={handleRaiseSale}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <span>Raise Sale</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

