'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Stethoscope,
  Award,
  CheckCircle2,
  Calendar,
  Building2,
  Cpu,
  HeartHandshake,
  FileCheck,
  ArrowRight,
  MapPin,
  Clock,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function AboutPage() {
  const doctors = [
    {
      name: 'Dr. Anitha Ramachandran',
      role: 'Chief Consultant Dermatologist & Medical Director',
      qualification: 'MBBS, MD - Dermatology, Venereology & Leprosy (Madras Medical College)',
      councilReg: 'Tamil Nadu Medical Council #89234',
      experience: '12+ Years Clinical Practice',
      location: 'Theni Main Branch & Visiting Consultant across branches',
      bio: 'Dr. Anitha specializes in recalcitrant acne vulgaris, severe atrophic scar revision through blunt cannula subcision, and safe chemical resurfacing for South Asian phototypes. She has trained extensively in dermatopathology and laser surgery.',
      focusAreas: ['Subcision for Rolling Scars', 'Pigmentary Disorders & Melasma', 'Pediatric Dermatology', 'Sequential Peels'],
    },
    {
      name: 'Dr. Rajesh Varma',
      role: 'Consultant Trichologist & Scalp Specialist',
      qualification: 'MBBS, Fellowship in Clinical Trichology & Hair Restoration (UK)',
      councilReg: 'Tamil Nadu Medical Council #94112',
      experience: '9+ Years Follicular Medicine',
      location: 'Madurai City Outlet',
      bio: 'Dr. Rajesh dedicated his career to non-surgical follicular preservation and biological growth factor therapies. He spearheaded Nila Clinic’s autologous double-spin PRP protocol that yields 5x platelet concentration compared to standard laboratory tubes.',
      focusAreas: ['Androgenetic Alopecia', 'Autologous High-Yield PRP', 'Computerized Trichoscopy', 'Scalp Mesotherapy'],
    },
    {
      name: 'Dr. Priya Dharshini',
      role: 'Lead Laser Surgeon & Aesthetic Practitioner',
      qualification: 'MBBS, DVD, Fellowship in Aesthetic Lasers (ESCAD Europe)',
      councilReg: 'Tamil Nadu Medical Council #103421',
      experience: '8+ Years Laser Physics & Dermatology',
      location: 'Chennai Laser Hub',
      bio: 'Dr. Priya specializes in optical laser interactions with high melanin-density skin. Her rigorous calibration standards ensure that our Class 4 Q-Switch and Diode lasers achieve optimal clearance without inducing post-inflammatory hyperpigmentation.',
      focusAreas: ['Q-Switch Nd:YAG Laser Toning', 'Triple-Wavelength Diode Hair Reduction', 'Tattoo Clearance', 'Vascular Lesions'],
    },
  ];

  const technologies = [
    {
      name: 'Top-Hat Q-Switch Nd:YAG (1064nm / 532nm)',
      brand: 'Class 4 Medical Laser System',
      description:
        'Employs flat-top beam optics that distribute energy evenly across the entire spot size, eliminating hot-spots that cause micro-blistering and hyperpigmentation in Indian skin.',
    },
    {
      name: 'Triple-Wavelength Diode Laser with Sapphire Cooling',
      brand: 'Simultaneous 755nm + 808nm + 1064nm',
      description:
        'Continuous -5°C sapphire contact cooling maintains epidermal safety while simultaneous multi-wavelength emission treats both deep terminal follicles and fine hair.',
    },
    {
      name: 'Fractional RF Microneedling Array',
      brand: 'Gold-Plated Insulated Micro-Electrode System',
      description:
        'Insulated needle shafts ensure that radiofrequency thermal micro-coagulation is delivered solely at the target dermal depth (0.5mm to 3.5mm), bypassing epidermal melanin completely.',
    },
    {
      name: 'Centrifuge PRP Separation System',
      brand: 'Dual-Spin Double-Speed Laboratory Protocol',
      description:
        'Utilizes gel-barrier vacutainers with precision 3200 RPM centrifugation to isolate high-viability platelet buffy coats with minimal erythrocyte contamination.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-800 font-sans selection:bg-emerald-800 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* About Hero */}
        <section className="bg-radial from-emerald-50/70 via-[#faf9f5] to-[#f4f2ea] border-b border-stone-200/80 pt-12 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                <span>Established 2018 in Theni, Tamil Nadu</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                About Nila Clinic
              </h1>
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
                Nila Clinic was founded to provide an uncompromising alternative to commercial cosmetic chains: an authentic clinical dermatology center grounded in scientific diagnostic protocols, board-certified medical doctors, and absolute price transparency.
              </p>
            </div>
          </div>
        </section>

        {/* CLINIC ORIGIN & PHILOSOPHY */}
        <section className="py-16 px-4 sm:px-8 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                Our Story & Vision
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Bridging the Gap Between Hospital Medicine and Aesthetic Care
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>
                  In 2018, Dr. Anitha Ramachandran noticed a critical void in Tamil Nadu’s healthcare landscape. Patients suffering from persistent skin and scalp conditions faced two extremes: sterile government or hospital OPDs where doctors lacked time for detailed aesthetic concerns, or unregulated commercial beauty parlors and salon chains making unsubstantiated claims with unqualified staff.
                </p>
                <p>
                  Nila Clinic was born in Theni to offer a third way: hospital-grade medical hygiene, US-FDA cleared machinery, and evidence-based treatments delivered in a warm, patient-centered clinic environment. Over the past 6 years, our commitment to zero overtreatment and genuine diagnostic care led to expansion into Madurai, Chennai, Coimbatore, and Trichy.
                </p>
                <p>
                  Today, our network serves thousands of patients annually. We remain fiercely independent and physician-owned, refusing corporate sales targets that compromise patient safety.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-3 gap-4 border-t border-stone-200 text-stone-800">
                <div>
                  <span className="font-mono text-xl sm:text-2xl font-bold block text-slate-900">5</span>
                  <span className="text-[11px] text-stone-500 font-medium">Full-Fledged Centers</span>
                </div>
                <div>
                  <span className="font-mono text-xl sm:text-2xl font-bold block text-slate-900">10,000+</span>
                  <span className="text-[11px] text-stone-500 font-medium">Documented Patients</span>
                </div>
                <div>
                  <span className="font-mono text-xl sm:text-2xl font-bold block text-slate-900">100%</span>
                  <span className="text-[11px] text-stone-500 font-medium">Doctor Supervised</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#0c2a23] text-white p-8 rounded-3xl space-y-6 shadow-xl">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Our Core Pledge</span>
                <h3 className="font-serif text-2xl font-bold">The Nila Clinical Charter</h3>
              </div>

              <ul className="space-y-4 text-xs text-stone-300">
                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Diagnosis Precedes Treatment:</strong>
                    No laser, peel, or scalp injection is administered without formal Wood’s lamp or trichoscopy evaluation.
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Zero Commission Quotas:</strong>
                    Our practitioners are salaried medical professionals, not salespeople. We never push unnecessary procedures.
                  </div>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Mandatory 48-Hour Patch Testing:</strong>
                    Safety first on Indian phototypes. We test test spots before initiating any course of peeling or laser therapy.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* MEDICAL FACULTY & CREDENTIALS */}
        <section id="doctors" className="py-20 px-4 sm:px-8 border-b border-stone-200 bg-[#faf9f5]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                Medical Leadership
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Board-Certified Doctors & Specialists
              </h2>
              <p className="text-stone-600 text-sm mt-1">
                Meet the medical professionals responsible for your clinical assessments, procedural calibrations, and post-treatment follow-up.
              </p>
            </div>

            <div className="space-y-8">
              {doctors.map((doc) => (
                <div
                  key={doc.name}
                  className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row gap-8 items-start"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0c2a23] text-emerald-200 font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shrink-0">
                    {doc.name.split(' ')[1][0]}
                  </div>

                  <div className="grow space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-slate-900">{doc.name}</h3>
                        <span className="text-xs font-semibold text-emerald-800 block mt-0.5">{doc.role}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-mono font-medium self-start sm:self-center">
                        {doc.councilReg}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Credentials</span>
                        <span className="text-stone-800 font-medium">{doc.qualification}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Base Clinic</span>
                        <span className="text-stone-800 font-medium flex items-center">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                          {doc.location}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                      {doc.bio}
                    </p>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1.5">
                        Specialized Clinical Focus:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.focusAreas.map((f) => (
                          <span key={f} className="text-xs bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/book?doctor=${encodeURIComponent(doc.name)}`}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0c2a23] hover:bg-[#123e34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Book In-Person Consultation with {doc.name.split(' ')[1]}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STERILIZATION & SAFETY STANDARDS */}
        <section id="safety" className="py-20 px-4 sm:px-8 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                Clinical Infection Control
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Sterilization & Safety Standards
              </h2>
              <p className="text-stone-600 text-sm mt-1">
                Hospital-grade protocols designed to eliminate cross-contamination and ensure patient safety across all branches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200 space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 inline-block">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-lg">Hospital-Grade Autoclaving</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  All reusable stainless-steel surgical instruments undergo ultrasonic bath cleaning followed by Class B vacuum autoclaving at 134°C with biological spore indicator monitoring.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200 space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 inline-block">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-lg">100% Single-Use Disposables</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Blunt subcision needles, microneedling cartridge tips, PRP vacuum tubes, and laser eye shields are opened strictly in front of the patient and disposed of in medical sharps containers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200 space-y-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 inline-block">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-slate-900 text-lg">Laser Safety Enclosure</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Dedicated Class 4 laser procedure suites fitted with non-reflective walls, interlocked door warning signage, and certified OD 7+ wavelength-specific patient eye shields.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ADVANCED TECHNOLOGY FLEET */}
        <section className="py-20 px-4 sm:px-8 bg-[#faf9f5] border-b border-stone-200">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                Precision Hardware
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Our Clinical Machinery Fleet
              </h2>
              <p className="text-stone-600 text-sm mt-1">
                We invest in certified medical systems to deliver predictable outcomes with zero epidermal thermal trauma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2"
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                    {tech.brand}
                  </span>
                  <h3 className="font-serif font-bold text-slate-900 text-lg">{tech.name}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-14 px-4 sm:px-8 bg-[#0c2a23] text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-serif text-2xl font-bold">Experience the Nila Clinic Difference</h3>
              <p className="text-xs text-stone-300">
                Book your initial diagnostic assessment at your nearest branch in Theni, Madurai, Chennai, Coimbatore, or Trichy.
              </p>
            </div>
            <Link
              href="/book"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
            >
              Book In-Clinic Consultation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
