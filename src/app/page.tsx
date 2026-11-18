'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Award,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Building2,
  FileText,
  UserCheck,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import TreatmentCard from '@/components/public/TreatmentCard';
import BeforeAfterSlider, { sampleCaseStudies } from '@/components/public/BeforeAfterSlider';
import TreatmentQuiz from '@/components/public/TreatmentQuiz';
import { TREATMENTS_DATA } from '@/data/treatmentsData';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);

  const categories = ['All', 'Skin Care', 'Laser Treatments', 'Hair & Scalp', 'Anti-Aging & Scars'];

  const filteredTreatments = TREATMENTS_DATA.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  );

  const doctors = [
    {
      name: 'Dr. Anitha Ramachandran',
      qualification: 'MBBS, MD - Dermatology, Venereology & Leprosy (DVL)',
      regNo: 'TNMC Reg #89234',
      experience: '12+ Years Clinical Experience',
      role: 'Chief Consultant Dermatologist',
      location: 'Theni Main Branch',
      focus: 'Acne Scar Subcision, Complex Dermatoses & Chemical Peels',
      initials: 'AR',
    },
    {
      name: 'Dr. Rajesh Varma',
      qualification: 'MBBS, Fellowship in Trichology & Hair Restoration (UK)',
      regNo: 'TNMC Reg #94112',
      experience: '9+ Years Clinical Trichology',
      role: 'Lead Trichologist & Hair Restoration Specialist',
      location: 'Madurai City Outlet',
      focus: 'Autologous PRP Therapy, Alopecia Reversal & Scalp Biomarkers',
      initials: 'RV',
    },
    {
      name: 'Dr. Priya Dharshini',
      qualification: 'MBBS, DVD, Fellowship in Aesthetic Lasers (ESCAD)',
      regNo: 'TNMC Reg #103421',
      experience: '8+ Years Laser Surgery',
      role: 'Head of Laser Technologies',
      location: 'Chennai Laser Hub',
      focus: 'Q-Switch Nd:YAG Toning, Diode Hair Reduction & Melasma Protocols',
      initials: 'PD',
    },
  ];

  const clinicBranches = [
    { name: 'Theni (Main Branch)', address: '42, Theni Main Road', phone: '+91 98450 11223', hours: '9:00 AM - 8:00 PM' },
    { name: 'Madurai City Outlet', address: '18, West Veli Street', phone: '+91 98450 44556', hours: '9:00 AM - 8:00 PM' },
    { name: 'Chennai Laser Hub', address: '7, Anna Salai, Thousand Lights', phone: '+91 98450 77889', hours: '10:00 AM - 8:30 PM' },
    { name: 'Coimbatore Aesthetic Center', address: '104, Avinashi Road, Peelamedu', phone: '+91 98450 88991', hours: '9:30 AM - 8:00 PM' },
    { name: 'Trichy Clinical Center', address: '25, Thillai Nagar Main Road', phone: '+91 98450 99002', hours: '9:00 AM - 7:30 PM' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* HERO SECTION: Previous Clean Clinical Theme */}
        <section className="relative pt-12 pb-20 px-4 sm:px-8 border-b border-slate-200 overflow-hidden bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dermatology · Class 4 Laser Aesthetics · Trichology</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Evidence-Based <span className="text-emerald-600">Skin & Hair Care</span> at Nila Clinic.
                </h1>

                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Founded in Theni and trusted across 5 clinical centers in Tamil Nadu. Experience personalized dermatological care, Hydra Facials, laser therapies, and PRP hair restoration performed by registered specialists.
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Link
                    href="/book"
                    className="px-7 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book In-Clinic Appointment</span>
                  </Link>

                  <Link
                    href="/treatments"
                    className="px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center justify-center space-x-2"
                  >
                    <span>View Treatment Menu</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>

                {/* Key Quality Assurances */}
                <div className="pt-6 grid grid-cols-3 gap-4 text-xs text-slate-700 border-t border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-mono text-base font-bold text-slate-900 block">10,000+</span>
                    <span className="text-[11px] text-slate-500 font-medium">Patients Treated</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono text-base font-bold text-slate-900 block">5 Branches</span>
                    <span className="text-[11px] text-slate-500 font-medium">Across Tamil Nadu</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono text-base font-bold text-slate-900 block">48-Hr Test</span>
                    <span className="text-[11px] text-slate-500 font-medium">Mandatory Patch Rule</span>
                  </div>
                </div>
              </div>

              {/* Right Column: In-Clinic Diagnostic Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">Direct Doctor Consultation</h2>
                        <p className="text-[11px] text-emerald-600 font-medium">OPD & Procedural Slots Open</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Walk-ins / Prior Booking
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Initial Dermatological OPD Fee:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">₹500</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        *Full ₹500 fee is 100% credited against your procedural treatment if scheduled within 14 days.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                        Included in Every First Visit:
                      </span>
                      <ul className="space-y-2 text-slate-700">
                        <li className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Computerized 60x Magnification Trichoscopy or Dermal Surface Analysis</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Fitzpatrick phototype grading & 48-hour dermal patch test</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Itemized prescription & realistic session timeline estimate</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/book"
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Reserve Consultation Slot</span>
                      </Link>
                    </div>

                    <p className="text-[10px] text-center text-slate-400">
                      Need urgent advice? Call Doctor line:{' '}
                      <a href="tel:+919845011223" className="font-mono font-semibold text-emerald-600 hover:underline">
                        +91 98450 11223
                      </a>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CLINICAL STANDARDS */}
        <section className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Medical Standards & Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How Clinical Dermatology Differs From Commercial Salons
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                Cosmetic clinics often rely on unregulated serums and unlicensed operators. At Nila Clinic, every protocol is governed by clinical safety benchmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Diagnostic Mapping Prior to Any Procedure
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We never begin treatment without Wood’s lamp fluorescence or microscopic trichoscopy. Understanding your dermal depth prevents ineffective surface treatments and stops paradoxical hyperpigmentation.
                </p>
                <div className="pt-2 text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Objective dermal metrics</span>
                </div>
              </div>

              <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  US-FDA Cleared Class 4 Lasers Only
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Low-cost imported machines cause burns on Indian skin. We invest exclusively in US-FDA certified triple-wavelength diodes and top-hat Q-Switch Nd:YAG lasers with active sapphire contact chill-tips.
                </p>
                <div className="pt-2 text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Integrated -5°C sapphire cooling</span>
                </div>
              </div>

              <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Zero Overtreatment & Transparent Pricing
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We refuse to sell 20-session packages when 4 targeted sessions will yield superior results. Every cost is itemized upfront with GST, zero hidden disposables charges, and full medical transparency.
                </p>
                <div className="pt-2 text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>No commercial commission quotas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIGNATURE CLINICAL SERVICES */}
        <section className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                  Clinical Services & Procedures
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Targeted Dermatological Treatments
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Filter by clinical category to view step-by-step protocols, downtimes, and transparent session costs.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/80 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Treatment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTreatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/treatments"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-2xs transition-all"
              >
                <span>View Full Treatment Menu & Indications</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>
          </div>
        </section>

        {/* CLINICAL CASE STUDIES & BEFORE / AFTER COMPARISON */}
        <section className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Verified In-Clinic Outcomes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Clinical Before & After Case Studies
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Unretouched clinical photography documented under standardized clinical lighting with patient medical consent. Drag the slider to compare baseline presentation to post-protocol outcome.
              </p>
            </div>

            {/* Case Selection Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {sampleCaseStudies.map((cs, idx) => (
                <button
                  key={cs.id}
                  onClick={() => setActiveCaseIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCaseIndex === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cs.title}</span>
                </button>
              ))}
            </div>

            {/* Slider Arena */}
            <div className="max-w-4xl mx-auto">
              <BeforeAfterSlider caseStudy={sampleCaseStudies[activeCaseIndex]} />
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/results"
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline"
              >
                <span>Explore all verified clinical case studies →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* INTERACTIVE TREATMENT ADVISOR QUIZ */}
        <section className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Personalized Care Assessment
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Find Your Tailored Clinical Protocol
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                Answer 3 quick clinical questions to receive an evidence-based recommendation, expected downtime, and estimated session schedule.
              </p>
            </div>

            <TreatmentQuiz />
          </div>
        </section>

        {/* MEDICAL FACULTY & DOCTORS */}
        <section id="doctors" className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                  Board-Certified Specialists
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Our Clinical Faculty
                </h2>
                <p className="text-slate-600 text-sm mt-1 max-w-xl">
                  Every consultation, diagnostic assessment, and procedural prescription is governed exclusively by certified dermatologists and trichologists.
                </p>
              </div>

              <Link
                href="/about"
                className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline flex items-center space-x-1"
              >
                <span>Read Medical Credentials & Research →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {doctors.map((doc) => (
                <div
                  key={doc.name}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all shadow-2xs"
                >
                  <div>
                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                        {doc.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {doc.name}
                        </h3>
                        <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                          {doc.role}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Qualification</span>
                        <span className="text-slate-800 font-medium">{doc.qualification}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Medical Council</span>
                        <span className="text-slate-800 font-mono text-[11px]">{doc.regNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Branch</span>
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{doc.location}</span>
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinical Focus</span>
                        <span className="text-slate-600 italic">{doc.focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <Link
                      href={`/book?doctor=${encodeURIComponent(doc.name)}`}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold text-center block transition-all"
                    >
                      Book OPD with {doc.name.split(' ')[1]}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5 CLINIC LOCATIONS */}
        <section className="py-20 px-4 sm:px-8 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Regional Presence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                5 State-of-the-Art Centers Across Tamil Nadu
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                All clinics follow identical medical sterilization protocols, pricing structures, and FDA-cleared machinery standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {clinicBranches.map((b) => (
                <div
                  key={b.name}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-1">
                      Full Service Hub
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                    <p className="text-xs text-slate-500 leading-snug">{b.address}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">{b.hours}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="text-xs font-mono font-bold text-emerald-600 hover:underline block"
                    >
                      {b.phone}
                    </a>
                    <Link
                      href="/contact"
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                    >
                      <span>Get Directions</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CALLOUT / CONSULTATION BANNER */}
        <section className="py-16 px-4 sm:px-8 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Begin Your Clinical Assessment
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Schedule a Medical Skin or Hair Evaluation
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Receive an objective diagnostic assessment, customized procedural plan, and full price breakdown with zero obligation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation Online</span>
              </Link>
              <a
                href="tel:+919845011223"
                className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call +91 98450 11223</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
