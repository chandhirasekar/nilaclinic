'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { TreatmentItem } from '@/data/treatmentsData';

export default function TreatmentCard({ treatment }: { treatment: TreatmentItem }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-700/60 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-md">
      {/* Top Banner / Category */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200/80">
            {treatment.category}
          </span>
          <span className="text-[11px] font-mono font-medium text-stone-500 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            {treatment.durationMinutes} Mins
          </span>
        </div>

        <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
          <Link href={`/treatments/${treatment.slug}`}>
            {treatment.title}
          </Link>
        </h3>

        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
          {treatment.subtitle}
        </p>

        {/* Clinical Specs Chips */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium">
            {treatment.downtime}
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium">
            {treatment.recommendedSessions.split(';')[0]}
          </span>
        </div>

        {/* Target Concerns */}
        <div className="mt-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Key Indications:
          </span>
          <div className="flex flex-wrap gap-1">
            {treatment.targetConcerns.slice(0, 3).map((c) => (
              <span key={c} className="text-[11px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
                • {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Action Section */}
      <div className="p-6 pt-4 bg-stone-50/70 border-t border-stone-100 mt-2">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Single Session
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="font-mono text-xl font-bold text-slate-900">₹{treatment.priceINR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-stone-500">+18% GST</span>
            </div>
          </div>

          {treatment.packagePriceINR && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                Course Package
              </span>
              <span className="font-mono text-xs font-bold text-emerald-900">
                ₹{treatment.packagePriceINR.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <Link
            href={`/treatments/${treatment.slug}`}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 text-slate-800 border border-stone-300 text-center transition-all flex items-center justify-center space-x-1"
          >
            <span>Protocol</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <Link
            href={`/book?service=${encodeURIComponent(treatment.title)}`}
            className="py-2.5 px-3 rounded-xl bg-[#0c2a23] hover:bg-[#123e34] text-white text-center transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>Book</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
