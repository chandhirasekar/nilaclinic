'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ArrowRight,
  Stethoscope,
  Clock,
  UserCheck,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BeforeAfterSlider, { sampleCaseStudies, CaseStudyData } from '@/components/public/BeforeAfterSlider';

export default function ResultsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Scars', 'Hair', 'Skin', 'Laser'];

  const filteredCases = sampleCaseStudies.filter(
    (c) => activeCategory === 'All' || c.category === activeCategory
  );

  const testimonials = [
    {
      patientName: 'Karthik S.',
      ageCity: '28 yrs, Madurai',
      treatment: 'Autologous PRP Therapy (6 Sessions)',
      doctor: 'Dr. Rajesh Varma',
      quote:
        'I had progressive crown thinning and had wasted money on over-the-counter hair gummies and commercial salon oils for 2 years. Dr. Rajesh conducted trichoscopy on day one, showed me my follicular miniaturization on screen, and placed me on a 6-session PRP protocol. By month 4, the bald spot on my vertex filled out significantly. No false promises, just medical facts.',
      rating: 5,
    },
    {
      patientName: 'Divya M.',
      ageCity: '25 yrs, Theni',
      treatment: 'Subcision + RF Microneedling (4 Sessions)',
      doctor: 'Dr. Anitha Ramachandran',
      quote:
        'Having severe ice-pick and rolling acne scars made me self-conscious for years. Dr. Anitha explained that surface creams would never work because my scars were tethered down to the fat layer. The subcision released the tension, and the RF stimulated collagen. My skin texture is at least 70% flatter now. It gave me my confidence back.',
      rating: 5,
    },
    {
      patientName: 'Meenakshi N.',
      ageCity: '39 yrs, Chennai',
      treatment: 'Q-Switch Nd:YAG Laser Toning (5 Sessions)',
      doctor: 'Dr. Priya Dharshini',
      quote:
        'I was terrified that lasers would burn or hyperpigment my dusky Indian skin. Dr. Priya performed a patch test behind my ear first and monitored it for 48 hours. The low-fluence 1064nm toning gradually dissolved my stubborn malar melasma without any peeling or redness. Exceptional medical expertise.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-800 font-sans selection:bg-emerald-800 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Page Hero */}
        <section className="bg-radial from-emerald-50/70 via-[#faf9f5] to-[#f4f2ea] border-b border-stone-200/80 pt-12 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Ethical Medical Photography & Case Records</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Verified Clinical Case Studies
              </h1>
              <p className="text-stone-600 text-base leading-relaxed">
                All photographs documented at Nila Clinic under standardized cross-polarized clinical illumination with informed patient medical consent. We do not use digital beauty filters, blurring tools, or misleading camera angles.
              </p>
            </div>

            {/* Category Filter */}
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#0c2a23] text-white shadow-2xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat === 'All' ? 'All Clinical Outcomes' : `${cat} Protocols`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Interactive Showcase */}
        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            {filteredCases.map((caseStudy) => (
              <div key={caseStudy.id} className="max-w-4xl mx-auto space-y-4">
                <BeforeAfterSlider caseStudy={caseStudy} />
                <div className="text-right">
                  <Link
                    href={`/book?service=${encodeURIComponent(caseStudy.title)}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 hover:underline"
                  >
                    <span>Schedule consultation for this protocol ({caseStudy.category})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Standardized Clinical Protocols Statement */}
        <section className="py-16 px-4 sm:px-8 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200 space-y-2">
                <h4 className="font-serif font-bold text-slate-900 text-lg">Standardized Lighting</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Baselines and post-procedure reviews are photographed in dedicated clinical booths at identical 5500K color temperatures and focal lengths to ensure scientific accuracy.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200 space-y-2">
                <h4 className="font-serif font-bold text-slate-900 text-lg">Objective Metrics</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We verify outcomes using computerized trichoscopy counts (hairs/cm²), MASI pigmentation scores, and dermal ultrasound measurements rather than subjective impressions.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#faf9f5] border border-stone-200 space-y-2">
                <h4 className="font-serif font-bold text-slate-900 text-lg">No Retouching Policy</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Strict policy against facial smoothing filters, artificial contrast adjustments, or altered angles. What you see is authentic dermal and follicular tissue transformation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Patient Testimonials */}
        <section className="py-20 px-4 sm:px-8 bg-[#faf9f5]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
                Patient Experiences
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900">
                Verified Patient Accounts
              </h2>
              <p className="text-stone-600 text-sm mt-2">
                Real feedback from patients treated across our Theni, Madurai, Chennai, Coimbatore, and Trichy centers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1 text-amber-500 text-sm">
                      {[...Array(t.rating)].map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed italic">
                      &quot;{t.quote}&quot;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <span className="font-bold text-slate-900 text-xs block">{t.patientName}</span>
                    <span className="text-[11px] text-stone-500 block">{t.ageCity}</span>
                    <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                      {t.treatment} · {t.doctor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking CTA Banner */}
        <section className="py-14 px-4 sm:px-8 bg-[#0c2a23] text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-serif text-2xl font-bold">Ready for a medical assessment?</h3>
              <p className="text-xs text-stone-300">
                Schedule your one-on-one consultation with our senior dermatologists and trichologists.
              </p>
            </div>
            <Link
              href="/book"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
            >
              Book In-Person Diagnostic Session
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
