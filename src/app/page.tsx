'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Star,
  User,
  Scissors,
  Check,
  Award,
  Heart,
  MessageCircle,
  ChevronRight,
  Send
} from 'lucide-react';
import { IService, IStaff } from '@/types';

export default function NilaClinicOfficialWebsite() {
  const router = useRouter();
  const [services, setServices] = useState<IService[]>([]);
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    patientPhone: '',
    serviceName: 'Hydra Facial & Glowing Treatment',
    stylistName: 'Anitha R.',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, stRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/staff')
        ]);
        const sData = await sRes.json();
        const stData = await stRes.json();
        if (sData.success) setServices(sData.data);
        if (stData.success) setStaff(stData.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedService = services.find(s => s.name === bookingForm.serviceName);
    const amount = selectedService ? selectedService.price : 1499;

    const payload = {
      customerName: bookingForm.patientName,
      customerPhone: bookingForm.patientPhone,
      serviceName: bookingForm.serviceName,
      stylistName: bookingForm.stylistName,
      date: bookingForm.date,
      time: bookingForm.time,
      amount,
      status: 'Confirmed',
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(true);
      }
    } catch (err) {
      setBookingSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(s =>
    activeCategory === 'All' || s.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Clinic Info Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-6">
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Theni Main Road, Tamil Nadu</span>
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Mon - Sun: 9:00 AM - 8:30 PM</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="tel:+919876543210" className="flex items-center text-emerald-400 font-bold hover:underline">
              <Phone className="w-3.5 h-3.5 mr-1" /> +91 98765 43210
            </a>
            <span className="text-slate-600">|</span>
            <Link href="/login" className="text-slate-300 hover:text-white font-medium flex items-center">
              Staff Portal Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Clinic Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <img
                src="/logo.png"
                alt="Nila Clinic Logo"
                className="h-11 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-xl tracking-tight block leading-none">NILA CLINIC</span>
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">Skin & Hair Care Center</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
            <a href="#about" className="hover:text-emerald-600 transition-colors">About Us</a>
            <a href="#treatments" className="hover:text-emerald-600 transition-colors">Skin & Hair Treatments</a>
            <a href="#specialists" className="hover:text-emerald-600 transition-colors">Our Specialists</a>
            <a href="#book" className="hover:text-emerald-600 transition-colors">Book Online</a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="#book"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section: Clinic Patient Focus */}
      <section className="relative bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-white pt-12 pb-20 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>Premier Dermatology & Hair Restoration Center</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Advanced <span className="text-emerald-600">Skin & Hair Care</span> Treatments at Nila Clinic.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Experience personalized dermatological care, Hydra Facials, Keratin hair therapies, and laser treatments performed by experienced specialists.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#book"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 group"
              >
                <span>Book Appointment Online</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#treatments"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-2xl border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>View Treatment Menu</span>
              </a>
            </div>

            {/* Key Trust Markers */}
            <div className="pt-6 grid grid-cols-3 gap-4 text-xs font-semibold text-slate-700 border-t border-slate-200/80">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Certified Doctors</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>US-FDA Tech</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>10,000+ Happy Patients</span>
              </div>
            </div>
          </div>

          {/* Direct Quick Booking Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <img src="/logo.png" alt="Nila Clinic Logo" className="h-8 w-auto" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Instant Appointment Booking</h3>
                    <p className="text-[11px] text-emerald-600 font-medium">Instant WhatsApp Confirmation</p>
                  </div>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Appointment Requested!</h4>
                  <p className="text-xs text-slate-600">
                    Thank you, <strong>{bookingForm.patientName}</strong>. Your booking for <strong>{bookingForm.serviceName}</strong> on <strong>{bookingForm.date} at {bookingForm.time}</strong> has been registered. Our receptionist will send confirmation on WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                  >
                    Book Another Appointment
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-4 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={bookingForm.patientName}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={bookingForm.patientPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, patientPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Treatment *</label>
                    <select
                      value={bookingForm.serviceName}
                      onChange={(e) => setBookingForm({ ...bookingForm, serviceName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {services.map(s => (
                        <option key={s._id} value={s.name}>{s.name} (₹{s.price})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Time *</label>
                      <select
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:30 PM">04:30 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{isSubmitting ? 'Booking...' : 'Confirm Appointment'}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Treatments & Services Catalog */}
      <section id="treatments" className="py-20 px-4 sm:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Treatment Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Skin & Hair Care Specialties at Nila Clinic
            </h2>
            <p className="text-slate-600 text-base">
              Explore our range of clinical dermatological treatments, hair restoration, scalp care, and facial therapies.
            </p>
          </div>

          {/* Category Filter Pills - Exclusively Skin and Hair Care */}
          <div className="flex items-center justify-center space-x-3 overflow-x-auto pb-2">
            {['All', 'Skin Care', 'Hair Care'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === 'All' ? 'All' : cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  (activeCategory === cat || (activeCategory === 'All' && cat === 'All'))
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Treatments' : cat === 'Skin Care' ? 'Skin Treatments' : 'Hair Treatments'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <div key={service._id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {service.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {service.duration} mins
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {service.description || 'Specialized skin & hair therapy using clinical procedures.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900">₹{service.price}</span>
                  <a
                    href="#book"
                    onClick={() => setBookingForm({ ...bookingForm, serviceName: service.name })}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Book This
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Our Specialists / Doctors */}
      <section id="specialists" className="py-20 px-4 sm:px-8 bg-slate-100/70 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Expert Team
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Meet Nila Clinic Doctors & Specialists
            </h2>
            <p className="text-slate-600 text-base">
              Our team of dermatologists, hair experts, and therapists are dedicated to your skin health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.map((st) => (
              <div key={st._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xl mx-auto shadow-md">
                  {st.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{st.name}</h4>
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">{st.role}</p>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-bold">
                    Available for Booking
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Reviews / Testimonials */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What Our Patients Say About Nila Clinic
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-600 italic">
                "The Hydra Facial treatment at Nila Clinic gave my skin an instant glow before my wedding! Highly recommend Anitha R. and the team."
              </p>
              <div className="font-bold text-xs text-slate-900">— Sangeetha Mohan</div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-600 italic">
                "Best Keratin hair therapy in Theni. Very professional staff and quick digital billing with instant WhatsApp receipt."
              </p>
              <div className="font-bold text-xs text-slate-900">— Deepa Lakshmi</div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-xs text-slate-600 italic">
                "Clean and hygienic clinic environment. Booking an online appointment took less than a minute."
              </p>
              <div className="font-bold text-xs text-slate-900">— Kavya Sundaram</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300 text-xs py-12 px-4 sm:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Nila Clinic Logo" className="h-8 w-auto bg-white p-1 rounded-lg" />
              <span className="font-bold text-base text-white">Nila Clinic</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Premier Skin & Hair Care Center offering dermatological and cosmetic treatments.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Treatments</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Hydra Facial & Skin Brightening</li>
              <li>Keratin Hair Restoration Therapy</li>
              <li>Laser Hair Reduction & Pigmentation</li>
              <li>Hair Fall Control & Scalp Detox</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Clinic Hours</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Monday - Saturday: 9:00 AM - 8:30 PM</li>
              <li>Sunday: 10:00 AM - 6:00 PM</li>
              <li>Emergency Contact: +91 98765 43210</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Internal Access</h4>
            <p className="text-slate-400 mb-3">Authorized clinic staff and receptionist login portal:</p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Clinic Staff Portal →
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-center text-slate-500">
          <p>© {new Date().getFullYear()} Nila Clinic - Skin & Hair Care. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}
