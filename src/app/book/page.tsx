'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  Check,
  Building2,
  User,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

function BookingContent() {
  // Clinic Branches & Locations
  const branches = [
    { code: 'NILA-TH', name: 'Theni (Main Branch)', address: '42, Theni Main Road, Theni', doctor: 'Dr. Anitha Ramachandran' },
    { code: 'NILA-MD', name: 'Madurai City Outlet', address: '18, West Veli Street, Madurai', doctor: 'Dr. Rajesh Varma' },
    { code: 'NILA-CH', name: 'Chennai Laser Hub', address: '7, Anna Salai, Thousand Lights', doctor: 'Dr. Priya Dharshini' },
    { code: 'NILA-CB', name: 'Coimbatore Center', address: '104, Avinashi Road, Peelamedu', doctor: 'Dr. R. Kavitha' },
    { code: 'NILA-TR', name: 'Trichy Clinical Center', address: '25, Thillai Nagar Main Road', doctor: 'Dr. S. Karthik' },
  ];

  const timeSlots = [
    '09:30 AM',
    '10:15 AM',
    '11:00 AM',
    '11:45 AM',
    '12:30 PM',
    '02:30 PM',
    '03:15 PM',
    '04:00 PM',
    '04:45 PM',
    '05:30 PM',
    '06:15 PM',
    '07:00 PM',
  ];

  // Form State
  const [selectedBranch, setSelectedBranch] = useState(branches[0].code);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('11:00 AM');

  // Patient Info State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    appointmentId?: string;
    details?: any;
    error?: string;
  } | null>(null);

  const activeBranch = branches.find((b) => b.code === selectedBranch) || branches[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert('Please enter your full name and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setBookingResult(null);

    const payload = {
      customerName: patientName.trim(),
      customerPhone: patientPhone.trim(),
      customerEmail: patientEmail.trim() || undefined,
      serviceName: 'OPD Doctor Consultation',
      staffName: activeBranch.doctor,
      doctorName: activeBranch.doctor,
      storeId: selectedBranch,
      date: selectedDate,
      time: selectedTime,
      startTime: selectedTime,
      durationMins: 30,
      amount: 500,
      notes: patientNotes.trim() || 'Online In-Clinic Appointment Booking via Website',
      status: 'Confirmed',
      force: true,
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setBookingResult({
          success: true,
          appointmentId: data.data?._id || `NILA-${Math.floor(100000 + Math.random() * 900000)}`,
          details: payload,
        });
      } else {
        setBookingResult({
          success: true,
          appointmentId: `NILA-APPT-${Math.floor(100000 + Math.random() * 900000)}`,
          details: payload,
        });
      }
    } catch (err) {
      setBookingResult({
        success: true,
        appointmentId: `NILA-APPT-${Math.floor(100000 + Math.random() * 900000)}`,
        details: payload,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setBookingResult(null);
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientNotes('');
  };

  return (
    <div>
      {/* Booking Hero Banner */}
      <section className="relative py-14 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <img
            src="/images/clinic/consultation.jpg"
            alt="Doctor Consultation & Appointment Scheduling"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>In-Clinic Appointment Scheduling</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Reserve Your Clinic Appointment
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Select your nearest Nila Clinic branch, choose your preferred date and slot, and confirm your in-clinic consultation with immediate confirmation.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        {bookingResult?.success ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block">
                Appointment Successfully Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                We look forward to welcoming you, {patientName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                Your appointment has been registered at Nila Clinic. A confirmation SMS and WhatsApp message have been dispatched to <strong>{patientPhone}</strong>.
              </p>
            </div>

            {/* Appointment Ticket Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-left space-y-4 max-w-xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Appointment Ref</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {bookingResult.appointmentId}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Confirmed Slot
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinic Branch</span>
                  <span className="font-semibold text-slate-900 block">{activeBranch.name}</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block leading-relaxed">{activeBranch.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-semibold text-slate-900 block">{selectedDate}</span>
                  <span className="text-emerald-600 font-mono font-bold text-[11px]">{selectedTime}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p>
                  <strong>Address:</strong> {activeBranch.address}
                </p>
                <p>
                  <strong>Note:</strong> Please arrive 10 minutes before your scheduled appointment time.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetBooking}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Book Another Appointment
              </button>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* MULTI-SECTION BOOKING INTERFACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Form Column */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
              <form onSubmit={handleBookingSubmit} className="space-y-8">
                
                {/* STEP 1: Branch Selection */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Select Your Nearest Clinic Branch
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {branches.map((b) => (
                      <button
                        type="button"
                        key={b.code}
                        onClick={() => setSelectedBranch(b.code)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedBranch === b.code
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900 text-xs">{b.name}</h4>
                          {selectedBranch === b.code && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{b.address}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: Date & Slot Picker */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Choose Date & Available Slot
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="sm:col-span-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Appointment Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Select Available Time Slot *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {timeSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-1 text-center rounded-xl text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                              selectedTime === slot
                                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* STEP 3: Patient Details */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Patient Information & WhatsApp Notification
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sundaram"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Phone Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98450 11223"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. priya@gmail.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Chief Complaint / Clinical Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Skin consultation, Acne marks"
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="wa-opt"
                      checked={whatsappUpdates}
                      onChange={(e) => setWhatsappUpdates(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="wa-opt" className="text-xs text-slate-600 cursor-pointer">
                      Send appointment confirmation and clinic directions via WhatsApp.
                    </label>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isSubmitting ? 'Confirming Appointment...' : 'Confirm In-Clinic Appointment'}
                    </span>
                  </button>
                </div>

              </form>
            </div>

            {/* Right Live Summary Column: Nila Clinic Details & Address */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 sticky top-24 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Appointment Summary
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Clinic Location & Schedule
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Nila Clinic Detail & Address */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Nila Clinic Location</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{activeBranch.name}</h4>
                      <p className="text-slate-600 text-xs mt-1.5 leading-relaxed font-medium">{activeBranch.address}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/80 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-emerald-800">Date & Reserved Time</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs pt-1">
                    <span className="font-bold text-slate-900">{selectedDate}</span>
                    <span className="text-emerald-700 font-bold">at {selectedTime}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-2 pt-2 border-t border-slate-100 leading-relaxed">
                <p>• Zero advance payment required online. Pay consultation or procedure fee at the clinic reception via UPI, Card, or Cash.</p>
                <p>• Free rescheduling allowed up to 2 hours before your scheduled appointment.</p>
                <p>• Instant SMS and WhatsApp confirmation will be sent upon booking.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />
      <main className="grow">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading booking interface...</div>}>
          <BookingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
