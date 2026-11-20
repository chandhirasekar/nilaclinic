'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function ContactPage() {
  const branches = [
    {
      code: 'NILA-TH',
      name: 'Theni (Main Branch)',
      address: '42, Theni Main Road, Theni, Tamil Nadu - 625531',
      phone: '+91 98450 11223',
      hours: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 9:00 AM - 2:00 PM',
      consultant: 'Dr. Anitha Ramachandran (MD DVL - Skin Specialist)',
      image: '/images/clinic/reception.jpg',
    },
    {
      code: 'NILA-MD',
      name: 'Madurai City Outlet',
      address: '18, West Veli Street, Opposite Railway Junction, Madurai - 625001',
      phone: '+91 98450 44556',
      hours: 'Mon - Sun: 9:00 AM - 8:00 PM',
      consultant: 'Dr. Rajesh Varma (Trichologist - Hair Specialist)',
      image: '/images/clinic/consultation.jpg',
    },
    {
      code: 'NILA-CH',
      name: 'Chennai Laser Hub',
      address: '7, Anna Salai, Thousand Lights, Chennai - 600002',
      phone: '+91 98450 77889',
      hours: 'Mon - Sun: 10:00 AM - 8:30 PM (Tue Off)',
      consultant: 'Dr. Priya Dharshini (Laser Specialist - Skin & Hair)',
      image: '/images/clinic/laser-suite.jpg',
    },
    {
      code: 'NILA-CB',
      name: 'Coimbatore Center',
      address: '104, Avinashi Road, Peelamedu, Coimbatore - 641004',
      phone: '+91 98450 88991',
      hours: 'Mon - Sat: 9:30 AM - 8:00 PM',
      consultant: 'Dr. R. Kavitha (Dermatologist)',
      image: '/images/clinic/reception.jpg',
    },
    {
      code: 'NILA-TR',
      name: 'Tiruchirappalli Branch',
      address: '25, Thillai Nagar Main Road, Trichy - 620018',
      phone: '+91 98450 99002',
      hours: 'Mon - Sun: 9:00 AM - 7:30 PM (Wed Off)',
      consultant: 'Dr. S. Karthik (Aesthetic Practitioner)',
      image: '/images/clinic/consultation.jpg',
    },
  ];

  // Inquiry Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBranch, setFormBranch] = useState(branches[0].name);
  const [formConcern, setFormConcern] = useState('Skin Treatment');
  const [formMessage, setFormMessage] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setFormSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Contact Hero with Regional Clinic Hubs Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <img
              src="/images/clinic/reception.jpg"
              alt="Nila Clinic Regional Centers"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>5 Regional Centers Across Tamil Nadu</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Clinic Locations & Direct Contact
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Visit our specialized Skin & Hair clinics across Tamil Nadu. All branches feature certified laser suites, sterile procedure rooms, and attending specialists.
              </p>
            </div>
          </div>
        </section>

        {/* Central Communications Bar */}
        <section className="bg-white border-b border-slate-200 py-5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor Booking Desk</span>
                <a href="tel:+919845011223" className="font-mono font-bold text-slate-900 text-sm hover:underline">
                  +91 98450 11223
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Support</span>
                <a href="mailto:care@nilaclinic.com" className="font-bold text-slate-900 text-sm hover:underline">
                  care@nilaclinic.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Hours</span>
                <span className="font-semibold text-slate-900 text-sm block">9:00 AM – 8:00 PM Daily</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Branches Directory */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our 5 Clinic Branches
              </h2>
            </div>

            <div className="space-y-4">
              {branches.map((b) => (
                <div
                  key={b.code}
                  className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between"
                >
                  <div className="w-full md:w-52 h-40 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative">
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {b.code}
                    </div>
                  </div>

                  <div className="space-y-2 grow">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{b.name}</h3>
                      <p className="text-xs text-slate-600 flex items-start space-x-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Attending Specialist</span>
                        <span className="text-slate-900 font-semibold">{b.consultant}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Working Hours</span>
                        <span className="text-slate-700 font-medium">{b.hours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-48 shrink-0 pt-2 md:pt-0">
                    <Link
                      href={`/book`}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </Link>

                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Patient Inquiry Form */}
        <section className="py-12 px-4 sm:px-8 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
                Direct Contact
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Send a Message to Our Clinical Desk
              </h2>
              <p className="text-slate-500 text-xs">
                Have a query regarding a skin or hair concern? Our clinical team will respond within 4 hours.
              </p>
            </div>

            {formSent ? (
              <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-3 max-w-md mx-auto">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Inquiry Received</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thank you, <strong>{formName}</strong>. Our medical desk at {formBranch} will contact you shortly at <strong>{formPhone}</strong>.
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="bg-slate-50 p-6 sm:p-7 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Treatment Category *</label>
                    <select
                      value={formConcern}
                      onChange={(e) => setFormConcern(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600 cursor-pointer"
                    >
                      <option value="Skin Treatment">Skin Treatment (Acne, Scars, Melasma, Laser)</option>
                      <option value="Hair Treatment">Hair Treatment (Hair Fall, Thinning, PRP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Clinic Branch *</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600 cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Clinical Question or Symptoms *</label>
                  <textarea
                    rows={3}
                    required
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Describe your skin or hair concern..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600"
                  />
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Sending...' : 'Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
