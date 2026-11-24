import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import TreatmentFilterSection from '@/components/public/TreatmentFilterSection';
import {
  getPublicClinicBranches,
  getPublicDoctors,
  getPublicTreatments,
} from '@/lib/publicData';

// Revalidate page cache every 60 seconds (Incremental Static Regeneration)
export const revalidate = 60;

export default async function HomePage() {
  // Parallel fetch for optimal SSR performance
  const [clinicBranches, doctors, treatments] = await Promise.all([
    getPublicClinicBranches(),
    getPublicDoctors(),
    getPublicTreatments(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar branches={clinicBranches} />

      <main className="grow">
        {/* HERO SECTION: Dynamic Skin & Hair Treatment Clips + Nila Clinic Title */}
        <section className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] lg:h-[640px] overflow-hidden bg-slate-950 select-none border-b border-slate-200">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/images/hero/nila-clinic-wall.jpg"
            className="w-full h-full object-cover object-center"
          >
            <source src="/videos/hero-clinic.webm" type="video/webm" />
            <source src="/videos/hero-clinic.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Subtle Bottom Vignette for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

          {/* Clean Tag, H1 & Responsive Content */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-8 lg:left-12 z-20 max-w-lg pointer-events-none pr-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm mb-1 sm:mb-1.5">
              Skin & Hair Clinic
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              Nila Clinic
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-200 mt-0.5 sm:mt-1 font-medium drop-shadow leading-snug">
              Advanced medical treatments for skin & hair care.
            </p>
          </div>
        </section>

        {/* CLINICAL STANDARDS - CONCISE */}
        <section className="py-16 px-4 sm:px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Medical Excellence
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Specialized Skin & Hair Care Standards
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Every consultation and procedure is performed exclusively by qualified dermatologists and trichologists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900">Diagnostic Skin & Hair Analysis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We use computerized Wood’s lamp dermascopy for skin and 60x trichoscopy for hair to examine tissue before initiating treatments.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900">US-FDA Cleared Class 4 Lasers</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certified diode and Q-Switch lasers with continuous -5°C sapphire contact cooling calibrated specifically for Indian skin tones.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900">Zero Overtreatment & Transparent Fees</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Only the sessions you genuinely need. All prices are published openly with zero hidden consumables charges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CLINICAL SERVICES: STRICTLY SKIN & HAIR (DYNAMIC FROM DB & EDITORIAL) */}
        <section className="py-16 px-4 sm:px-8 border-b border-slate-200 bg-slate-50">
          <TreatmentFilterSection initialTreatments={treatments} />
        </section>

        {/* MEDICAL FACULTY: SKIN & HAIR DOCTORS (DYNAMIC) */}
        <section id="doctors" className="py-16 px-4 sm:px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                  Board-Certified Doctors
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Our Skin & Hair Specialists
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Consult directly with certified dermatologists and trichologists.
                </p>
              </div>

              <Link
                href="/about#doctors"
                className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline flex items-center space-x-1"
              >
                <span>View Doctor Profiles →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc.name}
                  className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs"
                >
                  <div>
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        fill
                        unoptimized={Boolean(doc.image && (doc.image.startsWith('data:') || doc.image.startsWith('http')))}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none z-10" />
                      <div className="absolute bottom-3 left-4 right-4 text-white z-20">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                          {doc.role}
                        </span>
                        <h3 className="font-bold text-base leading-snug">{doc.name}</h3>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Qualification</span>
                        <span className="text-slate-800 font-medium">{doc.qualification}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Primary Clinic</span>
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{doc.location}</span>
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Clinical Focus</span>
                        <span className="text-slate-600 italic">{doc.focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/book?doctor=${encodeURIComponent(doc.name)}`}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold text-center block transition-all shadow-2xs"
                    >
                      Book OPD with {doc.name.split(' ')[1] || doc.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLINIC LOCATIONS (DYNAMIC FROM DATABASE) */}
        <section className="py-16 px-4 sm:px-8 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Regional Hubs
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {clinicBranches.length} Centers Across Tamil Nadu & Puducherry
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Identical medical standards, sterilizations, and pricing across all branches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {clinicBranches.map((b) => (
                <div
                  key={b.code}
                  className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3 hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mb-1">
                      {b.isMain ? 'Main Hospital Branch' : 'Full Service Clinic'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                    <p className="text-xs text-slate-500 leading-snug line-clamp-2">{b.address}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">{b.hours}</p>
                    {b.doctor && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Attending: {b.doctor}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="text-xs font-mono font-bold text-emerald-600 hover:underline block"
                    >
                      {b.phone}
                    </a>
                    <Link
                      href={`/book?branch=${b.code}`}
                      className="text-[11px] font-semibold text-slate-600 hover:text-emerald-700 flex items-center justify-between"
                    >
                      <span>Book at this center</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CALLOUT */}
        <section className="py-14 px-4 sm:px-8 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Skin & Hair Consultation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Schedule a Medical Skin or Hair Evaluation
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Receive an objective diagnostic assessment and customized treatment plan across our {clinicBranches.length} centers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                href="/book"
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
              </Link>
              <a
                href="tel:+919845011223"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call +91 98450 11223</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer branches={clinicBranches} />
    </div>
  );
}
