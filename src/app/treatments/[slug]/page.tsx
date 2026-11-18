import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Clock,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  Award,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { TREATMENTS_DATA, TreatmentItem } from '@/data/treatmentsData';

// Generate Static Params for all treatments
export function generateStaticParams() {
  return TREATMENTS_DATA.map((treatment) => ({
    slug: treatment.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TreatmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const treatment = TREATMENTS_DATA.find((t) => t.slug === slug);

  if (!treatment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-800 font-sans selection:bg-emerald-800 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Breadcrumb Bar */}
        <div className="bg-stone-100/70 border-b border-stone-200/70 py-2.5 px-4 sm:px-8 text-xs text-stone-500">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            <Link href="/" className="hover:text-emerald-800 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link href="/treatments" className="hover:text-emerald-800 transition-colors">Treatments</Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-slate-900 font-semibold truncate">{treatment.title}</span>
          </div>
        </div>

        {/* Treatment Hero Header */}
        <section className="bg-radial from-emerald-50/70 via-[#faf9f5] to-[#f4f2ea] border-b border-stone-200/80 pt-10 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Title & Overview */}
              <div className="lg:col-span-8 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider border border-emerald-200">
                    {treatment.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-medium">
                    {treatment.technology.split('with')[0]}
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                  {treatment.title}
                </h1>

                <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-sans">
                  {treatment.subtitle}
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Duration</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block flex items-center">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                      {treatment.durationMinutes} Minutes
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Downtime</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">
                      {treatment.downtime.split('(')[0]}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Course</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block truncate">
                      {treatment.recommendedSessions.split(';')[0]}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Physician</span>
                    <span className="font-semibold text-emerald-900 text-sm mt-0.5 block truncate">
                      {treatment.leadDoctor.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Quick Booking Box */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-lg space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                  Transparent In-Clinic Fee
                </span>
                
                <div className="border-b border-stone-100 pb-4">
                  <span className="text-xs text-stone-500 block">Single Session Investment</span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="font-mono text-3xl font-bold text-slate-900">
                      ₹{treatment.priceINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">+18% GST</span>
                  </div>
                </div>

                {treatment.packagePriceINR && (
                  <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Curated Treatment Package</span>
                      <span className="font-mono text-sm font-bold text-emerald-950">
                        ₹{treatment.packagePriceINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      {treatment.packageDescription}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Link
                    href={`/book?service=${encodeURIComponent(treatment.title)}`}
                    className="w-full py-3.5 bg-[#0c2a23] hover:bg-[#123e34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-emerald-300" />
                    <span>Book Procedure Consultation</span>
                  </Link>

                  <a
                    href="tel:+919845011223"
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold rounded-xl transition-all text-center block"
                  >
                    Call Doctor Line: +91 98450 11223
                  </a>
                </div>

                <div className="pt-2 text-[11px] text-stone-400 space-y-1 border-t border-stone-100">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>48-Hour Patch Testing Included</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Post-procedure emergency helpline access</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Content Tabs & Deep Dive */}
        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content Body */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* 1. Clinical Overview & Cellular Mechanism */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                  Medical Mechanism of Action
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  How This Clinical Protocol Operates
                </h2>
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
                  {treatment.overview}
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block uppercase tracking-wide">
                    Technology & Machinery Specification:
                  </span>
                  <p className="text-xs text-stone-600 font-mono leading-relaxed">
                    {treatment.technology}
                  </p>
                </div>
              </div>

              {/* 2. Step-by-Step Procedure Timeline */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                    Procedural Standard
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                    What Happens During the In-Clinic Session
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Every session adheres strictly to sterile Class 4 clinical guidelines.
                  </p>
                </div>

                <div className="space-y-4">
                  {treatment.stepByStepProtocol.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="flex items-start space-x-4 p-4 rounded-2xl bg-[#faf9f5] border border-stone-200/80"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#0c2a23] text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{step.title}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Indications & Contraindications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Clinical Indications</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {treatment.clinicalIndications.map((ind) => (
                      <li key={ind} className="flex items-start space-x-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    <span>Contraindications & Warnings</span>
                  </div>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {treatment.contraindications.map((ci) => (
                      <li key={ci} className="flex items-start space-x-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{ci}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. Post-Care Instructions */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                  Physician Aftercare Protocol
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Mandatory Post-Procedure Care
                </h3>
                <div className="space-y-2.5">
                  {treatment.postCareInstructions.map((inst, i) => (
                    <div key={i} className="flex items-start space-x-3 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <span className="font-mono font-bold text-emerald-800 shrink-0">0{i + 1}.</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. FAQs */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                    Patient Inquiries
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">
                    Frequently Asked Medical Questions
                  </h3>
                </div>

                <div className="space-y-4">
                  {treatment.faqList.map((faq, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#faf9f5] border border-stone-200/80 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-sm flex items-start space-x-2">
                        <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-xs text-stone-600 pl-6 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar Sticky Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Doctor In Charge Card */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Lead Clinical Consultant
                </span>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0c2a23] text-emerald-300 font-serif font-bold text-lg flex items-center justify-center shrink-0">
                    Dr
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">{treatment.leadDoctor}</h4>
                    <span className="text-[11px] text-emerald-800 font-semibold block">Registered Medical Specialist</span>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Our doctors personally configure every laser pulse fluence, chemical peel percentage, and injection depth. Therapists never operate independently.
                </p>

                <div className="pt-2 border-t border-stone-100">
                  <Link
                    href={`/book?doctor=${encodeURIComponent(treatment.leadDoctor)}`}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold text-center block transition-colors"
                  >
                    Consult Dr. In-Person
                  </Link>
                </div>
              </div>

              {/* Clinic Safety Standards Badge */}
              <div className="bg-[#0c2a23] text-white p-6 rounded-3xl border border-emerald-950 space-y-3.5">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-wider">Clinical Safety Standards</span>
                </div>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>100% Single-use disposable consumables</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Hospital-grade medical autoclave sterilization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>US-FDA cleared class 4 medical equipment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Direct post-procedure WhatsApp doctor helpline</span>
                  </li>
                </ul>
              </div>

              {/* Related Treatments */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Other Clinical Protocols
                </span>
                <div className="space-y-2">
                  {TREATMENTS_DATA.filter((t) => t.slug !== treatment.slug).slice(0, 4).map((t) => (
                    <Link
                      key={t.slug}
                      href={`/treatments/${t.slug}`}
                      className="block p-2.5 rounded-xl hover:bg-stone-50 transition-colors text-xs border border-transparent hover:border-stone-200"
                    >
                      <span className="font-semibold text-slate-800 block truncate">{t.title}</span>
                      <span className="text-[10px] text-stone-400">{t.category} · ₹{t.priceINR.toLocaleString('en-IN')}</span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
