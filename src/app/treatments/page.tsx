'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
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

  const categories = ['All', 'Skin Care', 'Laser Treatments', 'Hair & Scalp', 'Anti-Aging & Scars'];

  const concerns = [
    'All',
    'Acne & Scars',
    'Hair Thinning',
    'Pigmentation',
    'Facial Hair',
    'Pores & Dullness',
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
        matchesConcern = item.targetConcerns.some((c) =>
          /acne|scar|comedon/i.test(c)
        );
      } else if (selectedConcern === 'Hair Thinning') {
        matchesConcern = item.category === 'Hair & Scalp' || item.targetConcerns.some((c) => /hair|alopecia/i.test(c));
      } else if (selectedConcern === 'Pigmentation') {
        matchesConcern = item.targetConcerns.some((c) => /pigment|melasma|freckle|tan/i.test(c));
      } else if (selectedConcern === 'Facial Hair') {
        matchesConcern = item.targetConcerns.some((c) => /hirsutism|hair reduction/i.test(c));
      } else if (selectedConcern === 'Pores & Dullness') {
        matchesConcern = item.targetConcerns.some((c) => /pore|dull|texture|dehydration/i.test(c));
      }

      return matchesCategory && matchesSearch && matchesConcern;
    });
  }, [searchTerm, selectedCategory, selectedConcern]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Page Hero Header */}
        <section className="bg-gradient-to-b from-emerald-50/60 via-teal-50/30 to-white border-b border-slate-200 pt-12 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Standardized Clinical Treatment Directory</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Dermatology, Laser & Scalp Therapies
              </h1>
              <p className="text-slate-600 text-base leading-relaxed">
                Review complete procedural protocols, medical mechanisms of action, downtime expectations, and transparent single-session or package fees. Every procedure is physician-supervised and custom-calibrated to Fitzpatrick South Asian skin phototypes.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="mt-10 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              {/* Search Bar + Categories */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by condition (e.g. acne, melasma, PRP hair, diode laser)..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
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

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 flex items-center">
                  <Filter className="w-3 h-3 mr-1 text-emerald-600" />
                  Filter by Concern:
                </span>
                <div className="flex items-center space-x-1.5">
                  {concerns.map((con) => (
                    <button
                      key={con}
                      onClick={() => setSelectedConcern(con)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedConcern === con
                          ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
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

        {/* Treatment Cards Grid */}
        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Showing {filteredTreatments.length} Clinical Protocols
              </span>
              {(searchTerm || selectedCategory !== 'All' || selectedConcern !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedConcern('All');
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {filteredTreatments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-800">No matching protocols found</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  We could not find treatments matching &quot;{searchTerm}&quot;. Please adjust your search query or consult our dermatologists directly for a custom protocol.
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0c2a23] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  <span>Book In-Person Diagnostic Assessment</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTreatments.map((treatment) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CLINICAL PROTOCOL COMPARISON MATRIX */}
        <section className="py-16 px-4 sm:px-8 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Comparative Analysis
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Clinical Overview & Indication Matrix
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Reference this matrix to understand the depth of clinical intervention, expected downtime, and typical session courses.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Treatment</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Downtime</th>
                    <th className="py-3.5 px-4">Sessions</th>
                    <th className="py-3.5 px-4">Indications</th>
                    <th className="py-3.5 px-4">Fee (Single / Course)</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TREATMENTS_DATA.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <Link href={`/treatments/${t.slug}`} className="hover:text-emerald-600 hover:underline">
                          {t.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{t.downtime.split('(')[0]}</td>
                      <td className="py-3.5 px-4 text-slate-600">{t.recommendedSessions.split(';')[0]}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {t.targetConcerns.join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        ₹{t.priceINR.toLocaleString('en-IN')}{' '}
                        {t.packagePriceINR && (
                          <span className="text-[10px] text-emerald-600 block">
                            (Pkg: ₹{t.packagePriceINR.toLocaleString('en-IN')})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/book?service=${encodeURIComponent(t.title)}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider inline-flex items-center space-x-1 shadow-xs"
                        >
                          <span>Book</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-14 px-4 sm:px-8 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold">Unsure which protocol fits your skin type?</h3>
              <p className="text-xs text-slate-300">
                Book an initial ₹500 diagnostic assessment with Wood’s lamp mapping. 100% of the consultation fee is credited to your treatment.
              </p>
            </div>
            <Link
              href="/book"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0"
            >
              Book In-Person Consultation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
