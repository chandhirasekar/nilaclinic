'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Check,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { TREATMENTS_DATA } from '@/data/treatmentsData';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'packages' | 'individual'>('packages');

  const packages = [
    {
      id: 'hair-regrowth-6',
      name: 'Hair Regrowth & Density Course',
      category: 'Hair Treatments',
      sessions: '6 Sessions (Monthly)',
      singleTotal: '₹19,200',
      packagePrice: '₹14,999',
      savings: 'Save ₹4,201 (22% off)',
      popular: true,
      description: 'Comprehensive 6-month PRP protocol combining autologous double-spin PRP with scalp peptide microneedling.',
      features: [
        '6 Autologous High-Yield PRP Sessions (3200 RPM)',
        'Baseline 60x trichoscopy follicle tracking',
        'Copper Tripeptide-1 microneedle infusion',
        'Direct doctor review after every 2 sessions',
      ],
    },
    {
      id: 'skin-glow-4',
      name: 'Skin Radiance & Clarification Course',
      category: 'Skin Treatments',
      sessions: '4 Sessions (Every 3 Weeks)',
      singleTotal: '₹10,500',
      packagePrice: '₹7,999',
      savings: 'Save ₹2,501 (24% off)',
      popular: false,
      description: 'Alternating Hydra Facial vortex infusions with gentle antioxidant peeling for pore reduction and glow.',
      features: [
        '2 Full Medical Hydra Facials with pore extraction',
        '2 Mild Brightening Chemical Peels',
        'Calming LED red/blue light therapy after each session',
        'Zero downtime guarantee',
      ],
    },
    {
      id: 'scar-eraser-3',
      name: 'Acne Scar Subcision & RF Remodeling',
      category: 'Skin Treatments',
      sessions: '3 Sessions (6-Week Interval)',
      singleTotal: '₹13,500',
      packagePrice: '₹9,999',
      savings: 'Save ₹3,501 (26% off)',
      popular: false,
      description: 'Targeted scar revision: cannula subcision releases deep scar bands, followed by RF microneedling to build collagen.',
      features: [
        '3 Fractional RF Microneedling Sessions',
        'Blunt cannula subcision included for rolling scars',
        'Medical topical numbing included (zero pain)',
        'Chilled hyaluronic calming matrix mask',
      ],
    },
    {
      id: 'laser-hair-6',
      name: 'Diode Laser Hair Reduction Course',
      category: 'Skin Treatments',
      sessions: '6 Sessions (Every 4-6 Weeks)',
      singleTotal: '₹17,994',
      packagePrice: '₹11,999',
      savings: 'Save ₹5,995 (33% off)',
      popular: false,
      description: 'Triple-wavelength diode laser with -5°C sapphire chill-tip safely reduces facial and body hair without burns.',
      features: [
        '6 Full Face In-Motion Diode Laser Sessions',
        'Mandatory test patch before session 1',
        'Painless -5°C sapphire contact cooling',
        'Touch-up review session included',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Pricing Hero with Clinic Reception Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <img
              src="/images/clinic/reception.jpg"
              alt="Transparent Medical Billing Desk"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-xs">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Hidden Fees Guarantee</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Skin & Hair Treatment Pricing
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                All prices are published transparently with no hidden consumables charges. Your ₹500 consultation fee is 100% credited toward your treatment.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="mt-8 inline-flex p-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Skin & Hair Packages (Save up to 33%)
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'individual'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Single Session Menu
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Content */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            {/* VIEW A: TREATMENT PACKAGES */}
            {activeTab === 'packages' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-lg border p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-white relative ${
                      pkg.popular ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-2xs'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {pkg.category}
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-medium">{pkg.sessions}</span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-snug">{pkg.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>
                      </div>

                      {/* Price Box */}
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            Package Course Total
                          </span>
                          <div className="flex items-baseline space-x-2">
                            <span className="font-mono text-2xl font-bold text-slate-900">{pkg.packagePrice}</span>
                            <span className="text-xs text-slate-400 line-through">{pkg.singleTotal}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                          {pkg.savings}
                        </span>
                      </div>

                      {/* Features */}
                      <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <Link
                        href={`/book?service=${encodeURIComponent(pkg.name)}`}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Book Package</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW B: INDIVIDUAL MENU */}
            {activeTab === 'individual' && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Skin & Hair Single-Session Price List</h3>
                  <span className="text-xs text-slate-400">*All prices include 18% GST</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {TREATMENTS_DATA.map((t) => (
                    <div key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {t.category}
                          </span>
                          <span className="text-xs font-mono text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-emerald-600" />
                            {t.durationMinutes} Mins
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                        <p className="text-xs text-slate-500 leading-snug">{t.subtitle}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0">
                        <div className="text-right">
                          <span className="font-mono text-lg font-bold text-slate-900">₹{t.priceINR.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-400 block">+18% GST</span>
                        </div>
                        <Link
                          href={`/book?service=${encodeURIComponent(t.title)}`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                        >
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
