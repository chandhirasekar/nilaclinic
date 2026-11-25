'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  LayoutGrid,
  List,
  CalendarDays,
  Package,
  Loader2,
} from 'lucide-react';
import { IAppointment, IService, IStaff, ICustomer, ICustomerPackage } from '@/types';
import { useClinic } from '@/context/ClinicContext';
import Link from 'next/link';
import AppointmentDetailModal, { calculateEndTime } from '@/components/admin/AppointmentDetailModal';

function AppointmentsCalendarContent() {
  const { user, selectedStore, stores } = useClinic();
  const searchParams = useSearchParams();

  const customerIdParam = searchParams.get('customerId');
  const customerNameParam = searchParams.get('customerName');
  const customerPhoneParam = searchParams.get('customerPhone');
  const serviceNameParam = searchParams.get('serviceName');
  const packageNameParam = searchParams.get('packageName');

  // Calendar View: 'grid' (MioSalon Staff Day Grid) | 'cards' (Schedule Cards) | 'list' (Table View)
  const [currentView, setCurrentView] = useState<'grid' | 'cards' | 'list'>('grid');
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
  const [clientPackages, setClientPackages] = useState<ICustomerPackage[]>([]);
  const [inlineName, setInlineName] = useState('');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingService, setBookingService] = useState<string>('');
  const [bookingStaff, setBookingStaff] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [bookingDuration, setBookingDuration] = useState<number>(30);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [selectedSittingKey, setSelectedSittingKey] = useState<string | null>(null);
  const [isMultiSittingMode, setIsMultiSittingMode] = useState(false);
  const [packageSittingsSchedule, setPackageSittingsSchedule] = useState<
    { sittingNum: number; serviceName: string; date: string; time: string; staffName: string }[]
  >([]);

  // Double Booking Warning Modal (FR-61)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Cancellation Modal
  const [cancellingAppt, setCancellingAppt] = useState<IAppointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // MioSalon Appointment Detail Modal Popup
  const [selectedApptForDetails, setSelectedApptForDetails] = useState<IAppointment | null>(null);

  // Time Slot Interval: 15 Mins (Default matching MioSalon) or 30 Mins
  const [gridInterval, setGridInterval] = useState<15 | 30>(15);
  const [showColorCodeLegend, setShowColorCodeLegend] = useState(false);

  // Helper to parse time string (e.g. "10:15 AM") into minutes from midnight
  const parseTimeToMins = (timeStr: string): number => {
    if (!timeStr) return -1;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return -1;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Generate slot intervals between 09:00 AM and 08:00 PM (15m default matching MioSalon)
  const gridTimeSlots: string[] = [];
  const slotMinutes = gridInterval === 15 ? [0, 15, 30, 45] : [0, 30];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute of slotMinutes) {
      if (hour === 20 && minute > 0) break;
      const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const slotStr = `${h12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
      gridTimeSlots.push(slotStr);
    }
  }

  // 15-minute slot options for custom booking dropdown
  const bookingTimeSlots: string[] = [];
  for (let hour = 9; hour <= 20; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      if (hour === 20 && minute > 0) break;
      const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const slotStr = `${h12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
      bookingTimeSlots.push(slotStr);
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
        // BUG-20: Show only doctors in the appointment calendar columns and filter
        const calStaff = (staffData.data || []).filter(
          (s: IStaff) =>
            s.showInAppointmentCalendar !== false &&
            ((s.designation && s.designation.toLowerCase().includes('doc')) ||
              (s.loginRole && s.loginRole.toLowerCase() === 'doctor') ||
              (s.role && (s.role as string).toLowerCase() === 'doctor') ||
              (s.name && s.name.toLowerCase().startsWith('dr.')))
        );
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

  // If navigated from Packages or POS with query parameters, pre-populate and open modal
  useEffect(() => {
    if (customerIdParam && customerNameParam) {
      setSelectedClient({
        customerId: customerIdParam,
        name: customerNameParam,
        mobile: customerPhoneParam || '',
        gender: 'Female',
      } as any);
      setClientSearchMobile(customerPhoneParam || '');
      if (serviceNameParam) setBookingService(serviceNameParam);
      if (packageNameParam) {
        setBookingNotes(`[Package: ${packageNameParam}] Remaining Sitting Booking`);
      }
      setShowBookingModal(true);
    }
  }, [customerIdParam, customerNameParam, customerPhoneParam, serviceNameParam, packageNameParam]);

  // Load active customer packages when selectedClient is chosen
  useEffect(() => {
    const cId = selectedClient?.customerId || (selectedClient as any)?._id;
    if (cId) {
      fetch(`/api/packages/customer?customerId=${encodeURIComponent(cId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setClientPackages(data.data || []);
          } else {
            setClientPackages([]);
          }
        })
        .catch(() => setClientPackages([]));
    } else {
      setClientPackages([]);
    }
  }, [selectedClient]);

  // Handle mobile search for client lookup
  const handleClientMobileSearch = async (val: string) => {
    setClientSearchMobile(val);
    setSelectedClient(null);
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

  // Submit appointment booking (BUG-02: Double-click prevention with loading state)
  const handleSaveAppointment = async (force: boolean = false) => {
    if (isBooking) return;
    const clientName = selectedClient ? selectedClient.name : inlineName.trim();
    const clientPhone = selectedClient ? selectedClient.mobile : clientSearchMobile.trim();

    if (!clientName || !clientPhone || !bookingService || !bookingStaff) {
      alert('Client Name, Phone, Treatment, and Specialist are required.');
      return;
    }

    setIsBooking(true);
    const assignedStaffObj = staffMembers.find((s) => s.name === bookingStaff);

    // BUG-18: Multi-sitting package booking workflow
    if (isMultiSittingMode && packageSittingsSchedule.length > 0) {
      try {
        for (const sitting of packageSittingsSchedule) {
          const sStaff = staffMembers.find((s) => s.name === (sitting.staffName || bookingStaff));
          await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: selectedClient?.customerId || (selectedClient as any)?._id,
              customerName: clientName,
              customerPhone: clientPhone,
              serviceName: sitting.serviceName,
              staffName: sitting.staffName || bookingStaff,
              staffId: sStaff?._id,
              doctorId: sStaff?.designation === 'Doctor' ? sStaff._id : undefined,
              doctorName: sStaff?.designation === 'Doctor' ? sStaff.name : undefined,
              storeId: selectedStore,
              date: sitting.date,
              startTime: sitting.time,
              durationMins: bookingDuration,
              notes: `${bookingNotes} (Sitting ${sitting.sittingNum})`,
              force: true,
            }),
          });
        }
        setShowBookingModal(false);
        setIsMultiSittingMode(false);
        setPackageSittingsSchedule([]);
        setSelectedSittingKey(null);
        setSelectedClient(null);
        setClientSearchMobile('');
        setInlineName('');
        setBookingNotes('');
        loadAppointmentsAndMasters();
        alert(`Successfully scheduled all ${packageSittingsSchedule.length} package sittings!`);
        return;
      } catch (err) {
        alert('Failed to schedule some package sittings');
        return;
      } finally {
        setIsBooking(false);
      }
    }

    const payload = {
      customerId: selectedClient?.customerId || (selectedClient as any)?._id,
      customerName: clientName,
      customerPhone: clientPhone,
      serviceName: bookingService,
      staffName: bookingStaff,
      staffId: assignedStaffObj?._id,
      doctorId: assignedStaffObj?.designation === 'Doctor' ? assignedStaffObj._id : undefined,
      doctorName: assignedStaffObj?.designation === 'Doctor' ? assignedStaffObj.name : undefined,
      storeId: selectedStore,
      date: bookingDate || selectedDate,
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
    } finally {
      setIsBooking(false);
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
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">In Service</span>;
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

  // Filtered staff columns for MioSalon Grid view
  const visibleStaffMembers = staffMembers.filter(
    (st) => selectedStaffFilter === 'ALL' || st.name === selectedStaffFilter
  );

  return (
    <div className="space-y-4">
      {/* Top Header Bar (MioSalon Style) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Appointment Calendar</h1>
              <span className="text-[11px] font-semibold text-slate-500">
                MioSalon-Style Multi-Specialist Day Grid & Check-in • [{selectedStore}]
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Date Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 px-2 outline-none cursor-pointer text-xs"
            />
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            Today
          </button>

          {/* View Switcher: Staff Day Grid (MioSalon) | Schedule Cards | Table View */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-bold">
            <button
              onClick={() => setCurrentView('grid')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Staff Grid</span>
            </button>
            <button
              onClick={() => setCurrentView('cards')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                currentView === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          {/* MioSalon 15m vs 30m Slot Interval Toggle */}
          {currentView === 'grid' && (
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-bold items-center">
              <button
                type="button"
                onClick={() => setGridInterval(15)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  gridInterval === 15 ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="15-minute slot intervals"
              >
                15m
              </button>
              <button
                type="button"
                onClick={() => setGridInterval(30)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  gridInterval === 30 ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="30-minute slot intervals"
              >
                30m
              </button>
            </div>
          )}

          {/* MioSalon Color Code Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorCodeLegend(!showColorCodeLegend)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 border border-slate-200 transition shadow-2xs"
            >
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs inline-block" />
              <span>Color Code</span>
            </button>
            {showColorCodeLegend && (
              <div className="absolute right-0 mt-2 z-40 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 space-y-2 text-xs animate-in fade-in zoom-in-95">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex justify-between items-center text-sm">
                  <span>MioSalon Status Colors</span>
                  <button onClick={() => setShowColorCodeLegend(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">×</button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-[#3b82f6] shrink-0" /><span className="text-slate-700">New in-app booking (Booked)</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-[#a855f7] shrink-0" /><span className="text-slate-700">New online booking</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-[#eab308] shrink-0" /><span className="text-slate-700">Arrived (In Clinic)</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-[#22c55e] shrink-0" /><span className="text-slate-700">Started (In consultation)</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-[#f97316] shrink-0" /><span className="text-slate-700">No show</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-[#8b5cf6] shrink-0" /><span className="text-slate-700">Completed</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded bg-rose-500 shrink-0" /><span className="text-slate-700">Cancelled</span></div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowBookingModal(true);
              setConflictWarning(null);
            }}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, mobile, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Specialist Filter */}
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
          >
            <option value="ALL">All Doctors ({staffMembers.length})</option>
            {staffMembers.map((st) => (
              <option key={st._id} value={st.name}>
                {st.name} ({st.designation})
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['ALL', 'Booked', 'Arrived', 'In consultation', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ================= VIEW 1: MIOSALON STAFF COLUMN DAY GRID ================= */}
      {currentView === 'grid' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: visibleStaffMembers.length > 0 ? `${Math.max(850, 85 + visibleStaffMembers.length * 190)}px` : '100%' }}>
              {/* Sticky Staff Column Headers (BUG-03: Fixed count columns to prevent wrapping & align with time grid) */}
              <div
                className="grid border-b border-slate-200 bg-slate-50 sticky top-0 z-10 w-full"
                style={{
                  gridTemplateColumns: visibleStaffMembers.length > 0
                    ? `85px repeat(${visibleStaffMembers.length}, minmax(190px, 1fr))`
                    : '85px 1fr'
                }}
              >
                {/* Sticky Time Header */}
                <div className="p-3 text-left pl-3.5 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-200 sticky left-0 z-20 bg-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] w-[85px] shrink-0">
                  Time
                </div>
                {visibleStaffMembers.length === 0 ? (
                  <div className="p-3 text-slate-400 text-xs italic flex items-center pl-4 bg-slate-50">
                    No doctor schedule for this view
                  </div>
                ) : (
                  visibleStaffMembers.map((st) => {
                    const staffBookings = filteredAppointments.filter(
                      (a) => a.staffName === st.name || a.doctorName === st.name
                    );
                    return (
                      <div
                        key={st._id}
                        className="p-3 border-r border-slate-200 last:border-r-0 flex items-center space-x-2.5 bg-slate-50"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0"
                          style={{ backgroundColor: st.calendarColour || '#059669' }}
                        >
                          {st.name.charAt(0)}
                        </div>
                        <div className="truncate flex-1">
                          <div className="font-bold text-slate-900 text-sm truncate">{st.name}</div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs text-slate-600 truncate font-medium">{st.designation}</span>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {staffBookings.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Time Slots Grid Rows (BUG-03: Synchronized columns with header) */}
              <div className="divide-y divide-slate-100 w-full">
                {gridTimeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="grid min-h-[75px] w-full"
                    style={{
                      gridTemplateColumns: visibleStaffMembers.length > 0
                        ? `85px repeat(${visibleStaffMembers.length}, minmax(190px, 1fr))`
                        : '85px 1fr'
                    }}
                  >
                    {/* Sticky Time Label (Always anchored to the left while scrolling horizontally across doctors) */}
                    <div className="p-2.5 border-r border-slate-200 text-left pl-3.5 font-mono font-bold text-[11px] text-slate-700 bg-slate-50 flex items-start justify-start pt-3 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] w-[85px] shrink-0">
                      {slot}
                    </div>

                    {/* Staff Columns for this Time Slot */}
                    {visibleStaffMembers.length === 0 ? (
                      <div className="p-3 text-slate-300 text-xs flex items-center justify-start pl-4 border-r border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
                        —
                      </div>
                    ) : (
                      visibleStaffMembers.map((st) => {
                      const apptsInSlot = filteredAppointments.filter((a) => {
                        const matchesStaff = a.staffName === st.name || a.doctorName === st.name;
                        if (!matchesStaff) return false;
                        const apptTime = a.startTime || a.time || '';
                        if (apptTime === slot) return true;
                        if (gridInterval === 30) {
                          const slotMins = parseTimeToMins(slot);
                          const apptMins = parseTimeToMins(apptTime);
                          return apptMins >= slotMins && apptMins < slotMins + 30;
                        }
                        return false;
                      });

                      return (
                        <div
                          key={st._id}
                          className="p-1.5 border-r border-slate-100 last:border-r-0 relative group min-h-[75px] flex flex-col justify-center"
                        >
                          {apptsInSlot.length > 0 ? (
                            <div className="space-y-1.5">
                              {apptsInSlot.map((appt) => {
                                const staffColor = st.calendarColour || '#059669';
                                const startT = appt.startTime || appt.time || '10:00 AM';
                                const dur = appt.durationMins || 30;
                                const endT = calculateEndTime(startT, dur);

                                return (
                                  <div
                                    key={appt._id || appt.appointmentId}
                                    onClick={() => setSelectedApptForDetails(appt)}
                                    className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-1.5 relative overflow-hidden cursor-pointer group hover:border-blue-400"
                                    style={{ borderLeftWidth: '4px', borderLeftColor: staffColor }}
                                    title="Click to view full MioSalon appointment details"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100/90 px-1.5 py-0.5 rounded border border-slate-200">
                                        {startT} - {endT} ({dur}m)
                                      </span>
                                      {getStatusBadge(appt.status)}
                                    </div>

                                    <div>
                                      <div className="font-black text-slate-900 text-xs truncate group-hover:text-blue-600 transition">
                                        {appt.customerName}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {appt.customerPhone}
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-700 truncate">
                                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span className="truncate">{appt.serviceName}</span>
                                    </div>

                                    {appt.notes?.includes('Package') && (
                                      <span className="inline-block text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                                        🎁 Package Sitting
                                      </span>
                                    )}

                                    {/* Action Shortcuts */}
                                    <div className="pt-1 flex items-center justify-between border-t border-slate-100 gap-1 text-[10px]">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedApptForDetails(appt);
                                        }}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-0.5"
                                      >
                                        <span>Details →</span>
                                      </button>
                                      {appt.status === 'Booked' && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCheckIn(appt._id || appt.appointmentId!);
                                          }}
                                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-2xs transition"
                                        >
                                          ✓ Arrived
                                        </button>
                                      )}
                                      <Link
                                        href={`/admin/pos?mobile=${encodeURIComponent(appt.customerPhone)}&customerId=${encodeURIComponent(appt.customerId || '')}&serviceName=${encodeURIComponent(appt.serviceName)}&amount=${appt.amount || 0}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition ml-auto"
                                      >
                                        Raise Sale
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBookingStaff(st.name);
                                setBookingTime(slot);
                                setShowBookingModal(true);
                                setConflictWarning(null);
                              }}
                              className="h-full w-full min-h-[60px] rounded-lg border border-dashed border-transparent hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-center transition-all group/btn"
                            >
                              <span className="opacity-0 group-hover/btn:opacity-100 text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                                <Plus className="w-3 h-3" />
                                <span>Book {slot}</span>
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    }))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: SCHEDULE CARDS ================= */}
      {currentView === 'cards' && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
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
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Book New Appointment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((appt) => {
                const staffObj = staffMembers.find((s) => s.name === appt.staffName || s.name === appt.doctorName);
                const color = staffObj?.calendarColour || '#059669';

                return (
                  <div
                    key={appt._id || appt.appointmentId}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ backgroundColor: color }} />

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
                      <button
                        type="button"
                        onClick={() => setSelectedApptForDetails(appt)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition"
                      >
                        View Details
                      </button>

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

      {/* ================= VIEW 3: TABLE VIEW ================= */}
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
                    {appt.staffName || appt.doctorName || (appt as any).stylistName}
                  </td>
                  <td className="p-3.5">{getStatusBadge(appt.status)}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedApptForDetails(appt)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition"
                    >
                      View Details
                    </button>

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

      {/* ================= NEW APPOINTMENT BOOKING MODAL ================= */}
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
                    disabled={isBooking}
                    onClick={() => handleSaveAppointment(true)}
                    className="px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isBooking ? 'Overriding...' : 'Proceed Anyway (Override)'}
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
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                      >
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-slate-500 font-mono">{c.mobile}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedClient ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <strong>{selectedClient.name}</strong> • {selectedClient.mobile} (ID: {selectedClient.customerId})
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
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

              {/* Active Package Sittings Selector (BUG-18 & BUG-19) */}
              {clientPackages.filter((p) => (p.remainingSittings || 0) > 0).length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Active Package Sittings Ready to Schedule</span>
                    </span>
                    <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-bold">Prepaid</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {clientPackages.map((cp) =>
                      (cp.servicesRemaining || [])
                        .filter((s) => s.remainingCount > 0)
                        .map((s, idx) => {
                          const sittingKey = `${cp._id}-${idx}`;
                          const isSelected = selectedSittingKey === sittingKey;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                                  : 'bg-white border-purple-100'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold text-slate-800 block truncate">{s.serviceName}</span>
                                <span className="text-[10px] text-purple-700">
                                  {cp.packageName} • {s.remainingCount} sittings left
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedSittingKey(null);
                                      setBookingNotes('');
                                    } else {
                                      setSelectedSittingKey(sittingKey);
                                      setBookingService(s.serviceName);
                                      setBookingNotes(`[Package: ${cp.packageName}] Sitting ${s.usedCount + 1} of ${s.totalCount}`);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-2xs transition-all flex items-center space-x-1 ${
                                    isSelected
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>✓ Selected</span>
                                    </>
                                  ) : (
                                    <span>Use Sitting</span>
                                  )}
                                </button>
                                {s.remainingCount > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const now = new Date();
                                      const scheduleList = [];
                                      for (let i = 0; i < s.remainingCount; i++) {
                                        const d = new Date(now);
                                        d.setDate(d.getDate() + i * 7);
                                        scheduleList.push({
                                          sittingNum: s.usedCount + i + 1,
                                          serviceName: s.serviceName,
                                          date: d.toISOString().split('T')[0],
                                          time: bookingTime || '10:00 AM',
                                          staffName: bookingStaff,
                                        });
                                      }
                                      setPackageSittingsSchedule(scheduleList);
                                      setIsMultiSittingMode(true);
                                      setBookingService(s.serviceName);
                                      setBookingNotes(`[Package: ${cp.packageName}] Sittings 1 to ${s.remainingCount}`);
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold"
                                    title="Schedule all remaining sittings with Date & Time"
                                  >
                                    Schedule All ({s.remainingCount})
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

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
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
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
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    {staffMembers.map((st) => (
                      <option key={st._id} value={st.name}>
                        {st.name} ({st.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Time & Duration (BUG-18) */}
              {isMultiSittingMode && packageSittingsSchedule.length > 0 ? (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>Schedule All {packageSittingsSchedule.length} Package Sittings</span>
                    <button
                      type="button"
                      onClick={() => setIsMultiSittingMode(false)}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Switch to single appointment
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {packageSittingsSchedule.map((st, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100 text-xs">
                        <span className="font-bold text-indigo-900 w-16 shrink-0">Sitting #{st.sittingNum}</span>
                        <input
                          type="date"
                          value={st.date}
                          onChange={(e) => {
                            const updated = [...packageSittingsSchedule];
                            updated[i].date = e.target.value;
                            setPackageSittingsSchedule(updated);
                          }}
                          className="p-1.5 border border-slate-300 rounded-lg font-bold text-xs"
                        />
                        <select
                          value={st.time}
                          onChange={(e) => {
                            const updated = [...packageSittingsSchedule];
                            updated[i].time = e.target.value;
                            setPackageSittingsSchedule(updated);
                          }}
                          className="p-1.5 border border-slate-300 rounded-lg font-bold text-xs"
                        >
                          {bookingTimeSlots.map((ts) => (
                            <option key={ts} value={ts}>{ts}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Appointment Date *</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Time (15m slot) *</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                    >
                      {bookingTimeSlots.map((ts) => (
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
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                    </select>
                  </div>
                </div>
              )}

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
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Booking...</span>
                    </>
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CANCELLATION MODAL ================= */}
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

      {/* ================= MIOSALON APPOINTMENT DETAIL MODAL POPUP ================= */}
      <AppointmentDetailModal
        isOpen={Boolean(selectedApptForDetails)}
        onClose={() => setSelectedApptForDetails(null)}
        appointment={selectedApptForDetails}
        staffMembers={staffMembers}
        onAppointmentUpdated={() => {
          loadAppointmentsAndMasters();
        }}
        onCancelAppointment={(appt) => {
          setCancellingAppt(appt);
          setCancelReason('');
        }}
      />
    </div>
  );
}

export default function AppointmentsCalendarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Appointments Calendar...</div>}>
      <AppointmentsCalendarContent />
    </Suspense>
  );
}
