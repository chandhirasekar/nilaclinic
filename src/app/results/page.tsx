'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BeforeAfterSlider, { sampleCaseStudies, CaseStudyData } from '@/components/public/BeforeAfterSlider';

export default function ResultsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Strictly Skin & Hair Treatments
  const categories = ['All', 'Skin Treatments', 'Hair Treatments'];

  const filteredCases = sampleCaseStudies.filter((c) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Skin Treatments') return c.category === 'Skin';
    if (activeCategory === 'Hair Treatments') return c.category === 'Hair';
    return true;
  });

  const testimonials = [
    {
      patientName: 'Karthik S.',
      ageCity: '28 yrs, Madurai',
      treatment: 'Autologous PRP Hair Therapy (6 Sessions)',
      doctor: 'Dr. Rajesh Varma (Trichologist)',
      quote:
        'I had progressive crown thinning for 2 years. Dr. Rajesh conducted trichoscopy on day one and placed me on a 6-session PRP protocol. By month 4, the bald spot on my crown filled out visibly. No false promises, just real results.',
      rating: 5,
    },
    {
      patientName: 'Divya M.',
      ageCity: '25 yrs, Theni',
      treatment: 'Subcision + RF Microneedling (4 Sessions)',
      doctor: 'Dr. Anitha Ramachandran (Dermatologist)',
      quote:
        'Having deep acne scars made me self-conscious. Dr. Anitha explained how subcision releases the scar tension and RF rebuilds collagen. My skin texture is over 70% flatter now. It gave me my confidence back.',
      rating: 5,
    },
    {
      patientName: 'Meenakshi N.',
      ageCity: '39 yrs, Chennai',
      treatment: 'Q-Switch Laser Toning (5 Sessions)',
      doctor: 'Dr. Priya Dharshini (Laser Specialist)',
      quote:
        'Dr. Priya performed a patch test first. The 1064nm toning gradually dissolved my stubborn cheek melasma without any peeling or redness. Very professional care.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Page Hero with Clinical Documentation Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <img
              src="/images/clinic/consultation.jpg"
              alt="Clinical Skin and Hair Outcomes"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Patient Case Records</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Clinical Skin & Hair Results
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Unretouched clinical photography documented under standardized clinical lighting with patient medical consent. Drag the slider to compare baseline presentation to post-protocol outcome.
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
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 backdrop-blur-xs'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Interactive Showcase */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {filteredCases.map((caseStudy) => (
              <div key={caseStudy.id} className="max-w-4xl mx-auto space-y-3">
                <BeforeAfterSlider caseStudy={caseStudy} />
                <div className="text-right">
                  <Link
                    href={`/book?service=${encodeURIComponent(caseStudy.title)}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:underline"
                  >
                    <span>Consult for {caseStudy.title} ({caseStudy.category === 'Hair' ? 'Hair' : 'Skin'})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Patient Testimonials */}
        <section className="py-16 px-4 sm:px-8 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Patient Experiences
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified Patient Reviews
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="pt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-900 text-xs block">{t.patientName}</span>
                    <span className="text-[11px] text-slate-400 block">{t.ageCity}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                      {t.treatment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
