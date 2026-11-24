'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import TreatmentCard from '@/components/public/TreatmentCard';
import { TreatmentItem } from '@/data/treatmentsData';

interface TreatmentCatalogClientProps {
  initialTreatments: TreatmentItem[];
}

export default function TreatmentCatalogClient({ initialTreatments }: TreatmentCatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedConcern, setSelectedConcern] = useState('All');

  // Categories
  const categories = ['All', 'Skin Treatments', 'Hair Treatments'];

  const concerns = [
    'All',
    'Acne & Scars',
    'Hair Fall & Thinning',
    'Pigmentation & Toning',
    'Unwanted Hair',
  ];

  const filteredTreatments = useMemo(() => {
    return initialTreatments.filter((item) => {
      // Category match
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Search match
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.targetConcerns.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

      // Concern match
      let matchesConcern = true;
      if (selectedConcern === 'Acne & Scars') {
        matchesConcern = item.targetConcerns.some((c) => /acne|scar|pimple/i.test(c));
      } else if (selectedConcern === 'Hair Fall & Thinning') {
        matchesConcern = item.category === 'Hair Treatments' || item.targetConcerns.some((c) => /hair|alopecia/i.test(c));
      } else if (selectedConcern === 'Pigmentation & Toning') {
        matchesConcern = item.targetConcerns.some((c) => /pigment|melasma|spot|tan/i.test(c));
      } else if (selectedConcern === 'Unwanted Hair') {
        matchesConcern = item.targetConcerns.some((c) => /unwanted hair|hirsutism|ingrown/i.test(c));
      }

      return matchesCategory && matchesSearch && matchesConcern;
    });
  }, [initialTreatments, searchTerm, selectedCategory, selectedConcern]);

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-xl space-y-3 text-slate-800 mb-10">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search treatments (e.g. acne, PRP hair, melasma, laser)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Switcher */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Concern Quick Filters */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 flex items-center">
            <Filter className="w-3 h-3 mr-1 text-emerald-600" />
            Filter by Concern:
          </span>
          <div className="flex items-center space-x-1.5">
            {concerns.map((con) => (
              <button
                key={con}
                onClick={() => setSelectedConcern(con)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedConcern === con
                    ? 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {con}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredTreatments.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm">
            No treatments found matching &quot;{searchTerm}&quot; in {selectedCategory}.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedConcern('All');
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}
    </div>
  );
}

