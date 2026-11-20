'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface ConsultationCtaProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function ConsultationCta({
  title = 'Unsure Which Clinical Protocol Fits Your Condition?',
  subtitle = 'Avoid commercial guesswork. Schedule a diagnostic assessment with 60x Wood’s lamp dermal mapping or polarized video trichoscopy with our senior MD dermatologists.',
  badge = 'Physician-Supervised Dermal Diagnosis',
}: ConsultationCtaProps) {
  return (
    <section className="py-16 px-4 sm:px-8 bg-gradient-to-b from-slate-900 via-[#07131b] to-[#070d17] text-white relative overflow-hidden border-t border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-[#061a15]/90 border border-emerald-500/30 rounded-lg p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {title}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {subtitle}
              </p>

              {/* 3 Distinct Medical Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>₹500 Fee Credited</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    100% of consultation is adjusted against your treatment course.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Subsurface Scan</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Analyzes melanin depth, UV damage & follicle viability objectively.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <Stethoscope className="w-4 h-4 shrink-0" />
                    <span>Zero Quotas</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Physician-directed care with no commercial sales targets.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Action Box (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3.5 bg-slate-950/70 p-6 sm:p-7 rounded-lg border border-slate-800/80 backdrop-blur-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Schedule In-Clinic OPD
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Mon–Sat 9AM–8PM</span>
                </span>
              </div>

              <Link
                href="/book"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 group"
              >
                <Calendar className="w-4 h-4" />
                <span>Book In-Person Consultation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="https://wa.me/919845011223?text=Hello%20Nila%20Clinic,%20I%20would%20like%20to%20book%20a%20diagnostic%20assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Clinical Concierge</span>
              </a>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400">
                  Prefer direct phone booking?{' '}
                  <a
                    href="tel:+919845011223"
                    className="text-white font-bold font-mono hover:text-emerald-400 underline decoration-emerald-500/50 ml-1"
                  >
                    +91 98450 11223
                  </a>
                </span>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                  Theni (HQ) · Madurai · Chennai · Coimbatore · Trichy
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}