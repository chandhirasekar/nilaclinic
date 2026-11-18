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
  Building2,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function ContactPage() {
  const branches = [
    {
      code: 'NILA-TH',
      name: 'Theni (Main Clinic Branch)',
      address: '42, Theni Main Road, Near Old Bus Stand, Theni, Tamil Nadu - 625531',
      phone: '+91 98450 11223',
      email: 'theni@nilaclinic.com',
      hours: 'Monday to Saturday: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 2:00 PM',
      consultant: 'Dr. Anitha Ramachandran (MD DVL)',
      facilities: ['Dermatological Surgery Suite', 'Wood’s Lamp Diagnostic Room', 'Class 4 Laser Suite', 'Sterile Autoclave Bay'],
      parking: 'Dedicated patient car and two-wheeler parking available behind the building.',
    },
    {
      code: 'NILA-MD',
      name: 'Madurai City Outlet',
      address: '18, West Veli Street, Opposite Railway Junction, Madurai, Tamil Nadu - 625001',
      phone: '+91 98450 44556',
      email: 'madurai@nilaclinic.com',
      hours: 'Monday to Sunday: 9:00 AM - 8:00 PM (Open 7 Days)',
      consultant: 'Dr. Rajesh Varma (Trichology Fellow)',
      facilities: ['Trichology Video Dermatoscope', 'Double-Spin Centrifuge PRP Lab', 'Scalp Mesotherapy Cubicle'],
      parking: 'Valet parking available at entrance.',
    },
    {
      code: 'NILA-CH',
      name: 'Chennai Laser Hub',
      address: '7, Anna Salai, Thousand Lights, Chennai, Tamil Nadu - 600002',
      phone: '+91 98450 77889',
      email: 'chennai@nilaclinic.com',
      hours: 'Monday to Sunday: 10:00 AM - 8:30 PM (Tuesday Weekly Off)',
      consultant: 'Dr. Priya Dharshini (Laser Specialist)',
      facilities: ['Q-Switch Nd:YAG Suite', 'Triple-Wavelength Diode Suite', 'Fractional RF Microneedling Bay'],
      parking: 'Basement multi-level parking with elevator access.',
    },
    {
      code: 'NILA-CB',
      name: 'Coimbatore Aesthetic Center',
      address: '104, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004',
      phone: '+91 98450 88991',
      email: 'coimbatore@nilaclinic.com',
      hours: 'Monday to Saturday: 9:30 AM - 8:00 PM (Sunday Weekly Off)',
      consultant: 'Dr. R. Kavitha (Consultant Dermatologist)',
      facilities: ['Medical Hydra Facial Station', 'Chemical Resurfacing Room', 'Phototherapy Unit'],
      parking: 'On-site reserved parking slots.',
    },
    {
      code: 'NILA-TR',
      name: 'Tiruchirappalli Branch',
      address: '25, Thillai Nagar Main Road, Trichy, Tamil Nadu - 620018',
      phone: '+91 98450 99002',
      email: 'trichy@nilaclinic.com',
      hours: 'Monday to Sunday: 9:00 AM - 7:30 PM (Wednesday Weekly Off)',
      consultant: 'Dr. S. Karthik (Aesthetic Practitioner)',
      facilities: ['OPD Examination Chamber', 'Micro-Dermabrasion Suite', 'PRP Preparation Area'],
      parking: 'Dedicated front street parking.',
    },
  ];

  // Inquiry Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBranch, setFormBranch] = useState(branches[0].name);
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
    <div className="min-h-screen bg-[#faf9f5] text-slate-800 font-sans selection:bg-emerald-800 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Contact Hero */}
        <section className="bg-radial from-emerald-50/70 via-[#faf9f5] to-[#f4f2ea] border-b border-stone-200/80 pt-12 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                <span>5 Regional Clinical Hubs</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Clinic Locations & Direct Contact
              </h1>
              <p className="text-stone-600 text-base leading-relaxed">
                Walk in for an initial dermatological assessment or schedule your procedure in advance. All branches are equipped with standardized Class 4 medical laser suites, autoclave sterilization, and attending doctors.
              </p>
            </div>
          </div>
        </section>

        {/* Central Communications Bar */}
        <section className="bg-white border-b border-stone-200 py-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-700">
            <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#faf9f5] border border-stone-200">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Central Booking Desk</span>
                <a href="tel:+919845011223" className="font-mono font-bold text-slate-900 text-sm hover:underline">
                  +91 98450 11223
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#faf9f5] border border-stone-200">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Patient Support Email</span>
                <a href="mailto:care@nilaclinic.com" className="font-bold text-slate-900 text-sm hover:underline">
                  care@nilaclinic.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-[#faf9f5] border border-stone-200">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">General Operating Hours</span>
                <span className="font-semibold text-slate-900 text-sm block">9:00 AM – 8:30 PM Daily</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Branches Detailed Directory */}
        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                Branch Directory
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Our 5 Clinic Hubs Across Tamil Nadu
              </h2>
            </div>

            <div className="space-y-6">
              {branches.map((b) => (
                <div
                  key={b.code}
                  className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row gap-8 items-start justify-between"
                >
                  <div className="space-y-4 max-w-2xl">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-stone-100 text-stone-600">
                          {b.code}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800">Verified Clinical Facility</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-slate-900">{b.name}</h3>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans flex items-start space-x-1.5 pt-1">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Attending Doctor</span>
                        <span className="text-slate-900 font-semibold">{b.consultant}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Working Hours</span>
                        <span className="text-stone-700 font-medium">{b.hours}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                        In-House Clinical Suites:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {b.facilities.map((fac) => (
                          <span key={fac} className="text-[11px] bg-stone-50 border border-stone-200 text-stone-700 px-2.5 py-0.5 rounded-lg">
                            • {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                      <strong>Parking Info:</strong> {b.parking}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-64 shrink-0 pt-2 lg:pt-0">
                    <Link
                      href={`/book`}
                      className="w-full py-3 bg-[#0c2a23] hover:bg-[#123e34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center shadow-xs flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-4 h-4 text-emerald-300" />
                      <span>Book at this Branch</span>
                    </Link>

                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4 text-emerald-700" />
                      <span>Call: {b.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Patient Message / Medical Inquiry Form */}
        <section className="py-16 px-4 sm:px-8 bg-white border-t border-stone-200">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                Direct Patient Inquiries
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900">
                Send a Message to Our Clinical Desk
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm">
                Have a clinical question or require advice on procedure compatibility? Our senior nursing officer will review and reply within 4 business hours.
              </p>
            </div>

            {formSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">Message Delivered Successfully</h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Thank you, <strong>{formName}</strong>. Our front desk coordinator for <strong>{formBranch}</strong> has received your inquiry and will contact you at <strong>{formPhone}</strong> shortly.
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="mt-3 px-5 py-2 bg-[#0c2a23] text-white text-xs font-semibold rounded-xl"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="bg-[#faf9f5] rounded-3xl border border-stone-200 p-6 sm:p-10 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Krishnan"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 11223"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Target Branch *
                    </label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                    >
                      {branches.map((b) => (
                        <option key={b.code} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Your Medical Inquiry / Question *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your skin or hair concern, procedure interest, or preferred consultation timings..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-8 py-3.5 bg-[#0c2a23] hover:bg-[#123e34] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isSending ? 'Transmitting Message...' : 'Submit Clinical Inquiry'}</span>
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
