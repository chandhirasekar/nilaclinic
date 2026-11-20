'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Calendar,
  Filter,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import TreatmentCard from '@/components/public/TreatmentCard';
import { TREATMENTS_DATA, TreatmentItem } from '@/data/treatmentsData';

export default function TreatmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedConcern, setSelectedConcern] = useState('All');

  // Strictly Hair & Skin Treatments
  const categories = ['All', 'Skin Treatments', 'Hair Treatments'];

  const concerns = [
    'All',
    'Acne & Scars',
    'Hair Fall & Thinning',
    'Pigmentation & Toning',
    'Unwanted Hair',
  ];

  const filteredTreatments = useMemo(() => {
    return TREATMENTS_DATA.filter((item) => {
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
  }, [searchTerm, selectedCategory, selectedConcern]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Page Hero Header with Clinical Treatments Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <img
              src="/images/hero/laser-suite.jpg"
              alt="Skin and Hair Treatments"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Specialized Skin & Hair Care</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Skin & Hair Treatments
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Doctor-supervised clinical procedures for skin rejuvenation and follicular hair restoration. View step-by-step protocols, expected downtimes, and transparent session fees.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="mt-8 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-lg border border-white/20 shadow-xl space-y-3 text-slate-800">
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

                {/* Strictly Skin & Hair Category Switcher */}
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
          </div>
        </section>

        {/* Treatment Catalog Grid */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{filteredTreatments.length}</strong> {selectedCategory}
              </span>
              <span className="font-mono text-[11px]">All treatments supervised by MD Doctors</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTreatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>

            {filteredTreatments.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-slate-200 space-y-3">
                <p className="text-sm font-semibold text-slate-700">No treatments match your selected filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedConcern('All');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
