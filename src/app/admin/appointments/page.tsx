'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  Clock,
  User,
  Phone,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { IAppointment, IService, IStaff, ICustomer } from '@/types';
import { useClinic } from '@/context/ClinicContext';
import Link from 'next/link';

export default function AppointmentsCalendarPage() {
  const { user, selectedStore, stores } = useClinic();

  // Calendar View: 'cards' (Schedule Cards) | 'list' (Table View) - Fixes Bug 3
  const [currentView, setCurrentView] = useState<'cards' | 'list'>('cards');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Masters
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<IStaff[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [clientSearchMobile, setClientSearchMobile] = useState('');
  const [clientMatches, setClientMatches] = useState<ICustomer[]>([]);
  const [selectedClient, setSelectedClient] = useState<ICustomer | null>(null);
  const [isInlineClient, setIsInlineClient] = useState(false);
  const [inlineName, setInlineName] = useState('');
  const [inlineGender, setInlineGender] = useState<'Female' | 'Male' | 'Other'>('Female');

  // Booking Form State
  const [bookingService, setBookingService] = useState<string>('');
  const [bookingStaff, setBookingStaff] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [bookingDuration, setBookingDuration] = useState<number>(30);
  const [bookingNotes, setBookingNotes] = useState<string>('');

  // Double Booking Warning Modal (FR-61)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Cancellation Modal
  const [cancellingAppt, setCancellingAppt] = useState<IAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Generate 15-minute slot intervals between 09:00 AM and 08:00 PM (FR-56)
  const timeSlots: string[] = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      if (hour === 20 && minute > 0) break;
      const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const slotStr = `${h12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
      timeSlots.push(slotStr);
    }
  }

  // Load appointments and masters
  const loadAppointmentsAndMasters = async () => {
    setIsLoading(true);
    try {
      const [apptRes, staffRes, svcRes] = await Promise.all([
        fetch(`/api/appointments?storeCode=${selectedStore}&date=${selectedDate}`),
        fetch(`/api/masters/staff?storeCode=${selectedStore}`),
        fetch(`/api/masters/services?storeCode=${selectedStore}`),
      ]);

      const apptData = await apptRes.json();
      const staffData = await staffRes.json();
      const svcData = await svcRes.json();

      if (apptData.success) setAppointments(apptData.data || []);
      if (staffData.success) {
        const calStaff = (staffData.data || []).filter((s: IStaff) => s.showInAppointmentCalendar !== false);
        setStaffMembers(calStaff);
        if (calStaff.length > 0 && !bookingStaff) {
          setBookingStaff(calStaff[0].name);
        }
      }
      if (svcData.success) {
        setServices(svcData.data || []);
        if (svcData.data?.length > 0 && !bookingService) {
          setBookingService(svcData.data[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentsAndMasters();
  }, [selectedStore, selectedDate]);

  // Mobile search for booking client
  const handleClientMobileSearch = async (val: string) => {
    setClientSearchMobile(val);
    setSelectedClient(null);
    setIsInlineClient(false);
    if (val.trim().length >= 4) {
      try {
        const res = await fetch(`/api/customers?mobile=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        if (data.success) {
          setClientMatches(data.data || []);
          if (data.data.length === 1) {
            setSelectedClient(data.data[0]);
          }
        }
      } catch (e) {}
    } else {
      setClientMatches([]);
    }
  };

  // Submit appointment booking
  const handleSaveAppointment = async (force: boolean = false) => {
    const clientName = selectedClient ? selectedClient.name : inlineName.trim();
    const clientPhone = selectedClient ? selectedClient.mobile : clientSearchMobile.trim();

    if (!clientName || !clientPhone || !bookingService || !bookingStaff) {
      alert('Client Name, Phone, Treatment, and Specialist are required.');
      return;
    }

    const assignedStaffObj = staffMembers.find((s) => s.name === bookingStaff);

    const payload = {
      customerId: selectedClient?.customerId || selectedClient?._id,
      customerName: clientName,
      customerPhone: clientPhone,
      serviceName: bookingService,
      staffName: bookingStaff,
      staffId: assignedStaffObj?._id,
      doctorId: assignedStaffObj?.designation === 'Doctor' ? assignedStaffObj._id : undefined,
      doctorName: assignedStaffObj?.designation === 'Doctor' ? assignedStaffObj.name : undefined,
      storeId: selectedStore,
      date: selectedDate,
      startTime: bookingTime,
      durationMins: bookingDuration,
      notes: bookingNotes,
      force,
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.status === 409 && data.warning) {
        // Double booking warning (FR-61)
        setConflictWarning(data.message);
        return;
      }

      if (data.success) {
        setShowBookingModal(false);
        setConflictWarning(null);
        setSelectedClient(null);
        setClientSearchMobile('');
        setInlineName('');
        setBookingNotes('');
        loadAppointmentsAndMasters();
      } else {
        alert(data.message || 'Error booking appointment');
      }
    } catch (err) {
      alert('Failed to connect to appointments service');
    }
  };

  // Check-in (Arrived) Action (FR-62)
  const handleCheckIn = async (appointmentId: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          action: 'check-in',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Client checked in successfully. Doctor consultation queue updated!');
        loadAppointmentsAndMasters();
      } else {
        alert(data.message || 'Check-in failed');
      }
    } catch (e) {
      alert('Error updating appointment status');
    }
  };

  // Cancel Appointment Action (FR-63)
  const handleCancelAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingAppt) return;
    if (!cancelReason.trim()) {
      alert('Cancellation reason is required.');
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cancellingAppt._id || cancellingAppt.appointmentId,
          status: 'Cancelled',
          cancelReason: cancelReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancellingAppt(null);
        setCancelReason('');
        loadAppointmentsAndMasters();
      } else {
        alert(data.message || 'Cancellation failed');
      }
    } catch (e) {
      alert('Error cancelling appointment');
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Booked':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Booked</span>;
      case 'Arrived':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Arrived</span>;
      case 'In consultation':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">In Consultation</span>;
      case 'Completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case 'Cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      case 'No-show':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">No-show</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Filter appointments for display
  const filteredAppointments = appointments.filter((a) => {
    const matchesStaff =
      selectedStaffFilter === 'ALL' ||
      a.staffName === selectedStaffFilter ||
      a.doctorName === selectedStaffFilter ||
      a.staffId === selectedStaffFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesQuery =
      searchQuery === '' ||
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerPhone.includes(searchQuery) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStaff && matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Appointment Calendar & Check-in</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Module 6: Multi-specialist time grid, 15-minute slot intervals, double-booking warnings, and check-in to doctor queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Date Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 px-2 outline-none cursor-pointer"
            />
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Switcher (Cards / List - Replaces empty 15-min slot grid: Bug 3) */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCurrentView('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'cards' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schedule Cards
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'list' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => {
              setShowBookingModal(true);
              setConflictWarning(null);
            }}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, phone, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Specialist Filter */}
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Specialists & Doctors</option>
            {staffMembers.map((st) => (
              <option key={st._id} value={st.name}>
                {st.name} ({st.designation})
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {['ALL', 'Booked', 'Arrived', 'In consultation', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: APPOINTMENT SCHEDULE CARDS (Clean, usable, replaces empty 15-min slot grid: Bug 3) */}
      {currentView === 'cards' && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Appointments for {selectedDate}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no scheduled visits or consultations booked for this clinic branch on the selected date.
              </p>
              <button
                onClick={() => {
                  setShowBookingModal(true);
                  setConflictWarning(null);
                }}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Book New Appointment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((appt) => {
                const staffObj = staffMembers.find((s) => s.name === appt.staffName || s.name === appt.doctorName);
                const color = staffObj?.calendarColour || '#0284c7';

                return (
                  <div
                    key={appt._id || appt.appointmentId}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group"
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1.5"
                      style={{ backgroundColor: color }}
                    />

                    <div>
                      {/* Top Bar: Time & Status */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.startTime || appt.time}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({appt.durationMins || 30} mins)</span>
                        </div>
                        {getStatusBadge(appt.status)}
                      </div>

                      {/* Client Info */}
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{appt.customerName}</h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {appt.customerId || appt.appointmentId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          {appt.customerPhone}
                        </p>
                      </div>

                      {/* Service & Specialist */}
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                          <span className="flex items-center truncate">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0" />
                            <span className="truncate">{appt.serviceName}</span>
                          </span>
                          {appt.amount ? <span className="font-mono text-slate-700">₹{appt.amount}</span> : null}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                          <Stethoscope className="w-3 h-3 text-sky-500 shrink-0" />
                          <span className="truncate">Attending: <strong>{appt.staffName || appt.doctorName}</strong></span>
                        </div>
                      </div>

                      {appt.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">
                          &ldquo;{appt.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {appt.status === 'Booked' && (
                        <button
                          onClick={() => handleCheckIn(appt._id || appt.appointmentId!)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Arrived</span>
                        </button>
                      )}

                      {appt.status === 'Arrived' && (
                        <Link
                          href="/admin/patients"
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center space-x-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>In Doctor Queue</span>
                        </Link>
                      )}

                      {appt.status === 'Completed' && (
                        <Link
                          href="/admin/pos"
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs transition-all flex items-center space-x-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Quick Sale Bill</span>
                        </Link>
                      )}

                      {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                        <button
                          onClick={() => setCancellingAppt(appt)}
                          className="text-slate-400 hover:text-red-600 text-xs font-semibold p-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {currentView === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Service</th>
                <th className="p-3.5">Specialist</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.startTime || appt.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">{appt.date}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{appt.customerName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {appt.customerPhone}
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-800">{appt.serviceName}</td>
                  <td className="p-3.5 font-semibold text-slate-700">
                    {appt.staffName || appt.doctorName || appt.stylistName}
                  </td>
                  <td className="p-3.5">{getStatusBadge(appt.status)}</td>
                  <td className="p-3.5 text-right space-x-2">
                    {appt.status === 'Booked' && (
                      <button
                        onClick={() => handleCheckIn(appt._id || appt.appointmentId!)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Check-in
                      </button>
                    )}

                    {appt.status !== 'Cancelled' && (
                      <Link
                        href={`/admin/pos?mobile=${encodeURIComponent(appt.customerPhone)}`}
                        className="inline-flex items-center px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Bill POS
                      </Link>
                    )}

                    {appt.status === 'Booked' && (
                      <button
                        onClick={() => {
                          setCancellingAppt(appt);
                          setCancelReason('');
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No appointments scheduled for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* NEW APPOINTMENT BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Book Client Appointment</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Double-booking warning modal alert (FR-61) */}
            {conflictWarning && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Double Booking Conflict Detected!</span>
                </div>
                <p>{conflictWarning}</p>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConflictWarning(null)}
                    className="px-3 py-1 bg-white border border-amber-300 rounded text-slate-700 font-semibold"
                  >
                    Change Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAppointment(true)}
                    className="px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700"
                  >
                    Proceed Anyway (Override)
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAppointment(false);
              }}
              className="space-y-4 text-xs"
            >
              {/* Customer Lookup with Inline Add Client */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Client Mobile *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search by 10-digit mobile number..."
                    value={clientSearchMobile}
                    onChange={(e) => handleClientMobileSearch(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Match dropdown */}
                {clientMatches.length > 0 && !selectedClient && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                    {clientMatches.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setSelectedClient(c);
                          setClientMatches([]);
                        }}
                        className="p-2 hover:bg-sky-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-slate-500 font-mono">{c.mobile}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedClient ? (
                  <div className="bg-sky-50 border border-sky-200 text-sky-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <strong>{selectedClient.name}</strong> • {selectedClient.mobile} (ID: {selectedClient.customerId})
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className="text-sky-600 hover:text-sky-800 font-semibold"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mt-2 mb-1">Client Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={inlineName}
                      onChange={(e) => setInlineName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Service & Specialist */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treatment Service *</label>
                  <select
                    value={bookingService}
                    onChange={(e) => {
                      setBookingService(e.target.value);
                      const svc = services.find((s) => s.name === e.target.value);
                      if (svc?.duration) setBookingDuration(svc.duration);
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    {services.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name} ({s.duration}m - ₹{s.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Specialist *</label>
                  <select
                    value={bookingStaff}
                    onChange={(e) => setBookingStaff(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    {staffMembers.map((st) => (
                      <option key={st._id} value={st.name}>
                        {st.name} ({st.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time (15m slot) *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes / Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Skin sensitivity check requested, sitting 2 of laser protocol..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium transition"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancellingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Cancel Appointment</h3>
              <button onClick={() => setCancellingAppt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelAppointment} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to cancel the booking for{' '}
                <strong>{cancellingAppt.customerName}</strong> at {cancellingAppt.startTime || cancellingAppt.time}?
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Cancellation Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Client requested reschedule due to personal emergency..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingAppt(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
