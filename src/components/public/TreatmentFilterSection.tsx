'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TreatmentCard from '@/components/public/TreatmentCard';
import { TreatmentItem } from '@/data/treatmentsData';

interface TreatmentFilterSectionProps {
  initialTreatments: TreatmentItem[];
  limit?: number;
}

export default function TreatmentFilterSection({ initialTreatments, limit = 6 }: TreatmentFilterSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Skin Treatments', 'Hair Treatments'];

  const filteredTreatments = initialTreatments.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  );

  const displayedTreatments = limit ? filteredTreatments.slice(0, limit) : filteredTreatments;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
            Top Clinical Procedures
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Targeted Skin & Hair Treatments
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Doctor-supervised protocols for skin rejuvenation and follicular restoration.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1.5 rounded-lg border border-slate-300 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
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

      {/* Treatment Cards Grid (Top 6 on Home Page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTreatments.map((treatment) => (
          <TreatmentCard key={treatment.id} treatment={treatment} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/treatments"
          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
        >
          <span>View All Treatments ({initialTreatments.length} Procedures)</span>
          <ArrowRight className="w-4 h-4 text-emerald-100" />
        </Link>
      </div>
    </div>
  );
}

