'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { TreatmentItem } from '@/data/treatmentsData';

export default function TreatmentCard({ treatment }: { treatment: TreatmentItem }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-emerald-400 transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-md">
      <div>
        {/* Treatment Image Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <Image
            src={treatment.image}
            alt={treatment.title}
            fill
            unoptimized={Boolean(treatment.image && (treatment.image.startsWith('data:') || treatment.image.startsWith('http')))}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-emerald-800 border border-white/60 shadow-xs">
              {treatment.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-900/80 backdrop-blur-xs text-white flex items-center">
              <Clock className="w-3 h-3 mr-1 text-emerald-400" />
              {treatment.durationMinutes} Mins
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 pb-3">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
            <Link href={`/treatments/${treatment.slug}`}>
              {treatment.title}
            </Link>
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {treatment.subtitle}
          </p>

          {/* Clinical Specs Chips */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
              {treatment.downtime}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
              {treatment.recommendedSessions.split(';')[0]}
            </span>
          </div>

          {/* Target Concerns */}
          <div className="mt-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Key Indications:
            </span>
            <div className="flex flex-wrap gap-1">
              {treatment.targetConcerns.slice(0, 3).map((c) => (
                <span key={c} className="text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                  • {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Section (BUG-01: price block removed) */}
      <div className="p-5 pt-3 bg-slate-50/80 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <Link
            href={`/treatments/${treatment.slug}`}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-center transition-all flex items-center justify-center space-x-1"
          >
            <span>Protocol</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href={`/book?service=${encodeURIComponent(treatment.title)}`}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-center transition-all flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
