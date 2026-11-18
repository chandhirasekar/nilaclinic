'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Calendar,
  CreditCard,
  ArrowRight,
  Info,
  Clock,
  HelpCircle,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { TREATMENTS_DATA } from '@/data/treatmentsData';

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'individual' | 'packages'>('packages');

  const packages = [
    {
      id: 'hair-regrowth-6',
      name: 'Complete Hair Regrowth & Density Intensive',
      category: 'Hair & Scalp',
      sessions: '6 Sessions (Monthly Interval)',
      singleTotal: '₹19,200',
      packagePrice: '₹14,999',
      savings: 'Save ₹4,201 (22% off)',
      popular: true,
      description:
        'Comprehensive 6-month trichological protocol combining autologous double-spin PRP with scalp peptide microneedling and computerized digital follicle density tracking.',
      features: [
        '6 Autologous High-Yield PRP Sessions (3200 RPM double spin)',
        'Baseline 60x trichoscopy + 6-month follicle density count',
        'Copper Tripeptide-1 microneedle dermal delivery',
        'Direct doctor follow-up after every 2 sessions',
        'Valid across all 5 Nila Clinic branches',
      ],
      suitableFor: 'Grade 1-3 Androgenetic Alopecia & Chronic Telogen Effluvium',
    },
    {
      id: 'bridal-glow-4',
      name: 'Bridal Radiance & Skin Clarification Protocol',
      category: 'Skin Care',
      sessions: '4 Sessions (Every 3 Weeks)',
      singleTotal: '₹10,500',
      packagePrice: '₹7,999',
      savings: 'Save ₹2,501 (24% off)',
      popular: false,
      description:
        'Engineered for brides, grooms, and milestone events: alternating Hydra Facial vortex infusions with gentle antioxidant chemical peels for pore reduction and luminous glass skin.',
      features: [
        '2 Full Medical Hydra Facials with vortex comedone extraction',
        '2 Mild Glycolic-Lactic Brightening Peels',
        'Photobiomodulation LED soothing therapy after each session',
        'Custom pre-event barrier repair recovery serum kit',
        'Zero downtime guarantee before your main events',
      ],
      suitableFor: 'Pre-wedding skin preparation, photo shoots, and dull textured skin',
    },
    {
      id: 'scar-eraser-3',
      name: 'Acne Scar Subcision & RF Dermal Remodeling',
      category: 'Scars & Texture',
      sessions: '3 Sessions (6-Week Interval)',
      singleTotal: '₹13,500',
      packagePrice: '₹9,999',
      savings: 'Save ₹3,501 (26% off)',
      popular: false,
      description:
        'Targeted clinical scar reconstruction: blunt cannula subcision releases deep fibrotic scar tethers, followed by fractionated bipolar RF micro-needling to rebuild missing dermal collagen.',
      features: [
        '3 Fractional RF Microneedling Sessions with gold-plated needles',
        'Blunt cannula subcision included for rolling scars',
        'Topical medical compound anesthesia included (zero pain)',
        'Centrifuged growth factor or sterile hyaluronic flood mask',
        'Includes post-procedure medical calming barrier cream',
      ],
      suitableFor: 'Ice-pick, boxcar, and rolling post-acne scars',
    },
    {
      id: 'laser-hair-6',
      name: 'Full Face Laser Hair Reduction Annual Course',
      category: 'Laser Aesthetics',
      sessions: '6 Sessions (Every 4-6 Weeks)',
      singleTotal: '₹17,994',
      packagePrice: '₹11,999',
      savings: 'Save ₹5,995 (33% off)',
      popular: false,
      description:
        'Triple-wavelength diode laser with -5°C sapphire chill-tip safely treats chin, upper lip, jawline, and sideburns without the risk of hyperpigmentation on South Asian phototypes.',
      features: [
        '6 Full Face In-Motion Diode Laser Sessions (755+808+1064nm)',
        'Mandatory patch test and skin tolerance check before session 1',
        'Includes touch-up review session at 9 months',
        '100% painless sapphire contact cooling technology',
        'Medical hormonal hirsutism consultation with doctor',
      ],
      suitableFor: 'Facial hirsutism, PCOS-induced chin hair, and coarse facial follicles',
    },
  ];

  const pricingFaqs = [
    {
      q: 'Are there any hidden costs for disposables or doctor examination?',
      a: 'Absolutely none. All published fees include doctor assessment, procedural equipment, single-use sterile consumables (cannula, vacutainers, needles), and post-procedure calming masks. GST (18%) is transparently stated on your computerized invoice.',
    },
    {
      q: 'How does the ₹500 consultation fee adjustment work?',
      a: 'When you book an initial OPD diagnostic consultation, the fee is ₹500. If you proceed with any procedural treatment or package within 14 days, the entire ₹500 is deducted from your treatment bill.',
    },
    {
      q: 'What if I relocate or travel between clinic branches?',
      a: 'All Nila Clinic packages are 100% interchangeable across our 5 branches in Theni, Madurai, Chennai, Coimbatore, and Trichy. Your treatment history is shared digitally on our internal clinical portal.',
    },
    {
      q: 'Do you offer 0% interest EMI options?',
      a: 'Yes. For treatment packages of ₹10,000 and above, we provide 3-month and 6-month 0% interest credit card EMI options with all major Indian banks.',
    },
    {
      q: 'Can I transfer unused package sessions to a family member?',
      a: 'Yes. If a medical reason or life circumstance prevents you from completing your package, unused sessions can be transferred to a first-degree family member (spouse, child, sibling, or parent) with written consent.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-800 font-sans selection:bg-emerald-800 selection:text-white flex flex-col">
      <Navbar />

      <main className="grow">
        {/* Pricing Hero */}
        <section className="bg-radial from-emerald-50/70 via-[#faf9f5] to-[#f4f2ea] border-b border-stone-200/80 pt-12 pb-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-900/20 text-emerald-900 text-xs font-semibold">
                <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
                <span>Zero Hidden Fees Guarantee</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Transparent Clinical Pricing
              </h1>
              <p className="text-stone-600 text-base leading-relaxed">
                We believe in medical honesty. Every price is published openly with no sales commission markups, no unexpected charges for sterile consumables, and 100% credit of your ₹500 consultation fee toward your treatment.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="mt-8 inline-flex p-1.5 bg-stone-200/80 rounded-2xl border border-stone-300/80 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-[#0c2a23] text-white shadow-xs'
                    : 'text-stone-700 hover:text-slate-900'
                }`}
              >
                Curated Treatment Packages (Save up to 33%)
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'individual'
                    ? 'bg-[#0c2a23] text-white shadow-xs'
                    : 'text-stone-700 hover:text-slate-900'
                }`}
              >
                Individual Single-Session Menu
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Content */}
        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* VIEW A: TREATMENT PACKAGES */}
            {activeTab === 'packages' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between space-y-6 relative ${
                        pkg.popular
                          ? 'bg-white border-emerald-800/80 shadow-md ring-1 ring-emerald-800/20'
                          : 'bg-white border-stone-200/90 shadow-2xs'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#0c2a23] text-white text-[10px] font-bold uppercase tracking-wider border border-emerald-950">
                          Most Prescribed Course
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {pkg.category}
                          </span>
                          <span className="text-xs font-mono text-stone-500 font-medium">
                            {pkg.sessions}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-2xl font-bold text-slate-900 leading-snug">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>

                        {/* Price Box */}
                        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-baseline justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                              Package Course Total
                            </span>
                            <div className="flex items-baseline space-x-2">
                              <span className="font-mono text-3xl font-bold text-slate-900">
                                {pkg.packagePrice}
                              </span>
                              <span className="text-xs text-stone-400 line-through">
                                {pkg.singleTotal}
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                            {pkg.savings}
                          </span>
                        </div>

                        {/* Features Checklist */}
                        <div className="space-y-2.5 pt-2">
                          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                            Included in this Protocol:
                          </span>
                          <ul className="space-y-2 text-xs text-stone-700">
                            {pkg.features.map((feat, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-100 space-y-2">
                        <Link
                          href={`/book?service=${encodeURIComponent(pkg.name)}`}
                          className="w-full py-3.5 bg-[#0c2a23] hover:bg-[#123e34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
                        >
                          <Calendar className="w-4 h-4 text-emerald-300" />
                          <span>Reserve Course Package</span>
                        </Link>
                        <span className="text-[11px] text-center text-stone-400 block">
                          Ideal for: {pkg.suitableFor}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW B: INDIVIDUAL SINGLE SESSION MENU */}
            {activeTab === 'individual' && (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900">Individual Session Menu</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Pay-as-you-go pricing for single clinical procedures.</p>
                  </div>
                  <span className="text-xs font-medium text-stone-500">
                    *All single sessions include consultation review & patch testing.
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf9f5] border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      <tr>
                        <th className="py-3.5 px-6">Treatment</th>
                        <th className="py-3.5 px-6">Category</th>
                        <th className="py-3.5 px-6">Duration</th>
                        <th className="py-3.5 px-6">Single Session Fee</th>
                        <th className="py-3.5 px-6">Course Package</th>
                        <th className="py-3.5 px-6 text-right">Book</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {TREATMENTS_DATA.map((t) => (
                        <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            <Link href={`/treatments/${t.slug}`} className="hover:text-emerald-800 hover:underline">
                              {t.title}
                            </Link>
                            <span className="text-[11px] text-stone-400 block font-normal">{t.technology.split('with')[0]}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                              {t.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-stone-600">{t.durationMinutes} Mins</td>
                          <td className="py-4 px-6 font-mono font-bold text-slate-900 text-sm">
                            ₹{t.priceINR.toLocaleString('en-IN')}
                            <span className="text-[10px] text-stone-400 block font-normal">+18% GST</span>
                          </td>
                          <td className="py-4 px-6 font-mono font-semibold text-emerald-900">
                            {t.packagePriceINR ? `₹${t.packagePriceINR.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/book?service=${encodeURIComponent(t.title)}`}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0c2a23] hover:bg-[#123e34] text-white text-[11px] font-bold uppercase tracking-wider inline-flex items-center space-x-1"
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
            )}

            {/* TRUST MARKERS BANNER */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-stone-200/90 text-center space-y-1.5">
                <span className="font-mono text-xl font-bold text-slate-900 block">₹500 OPD Credit</span>
                <p className="text-xs text-stone-500">100% credited against your treatment if booked within 14 days.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/90 text-center space-y-1.5">
                <span className="font-mono text-xl font-bold text-slate-900 block">0% Interest EMI</span>
                <p className="text-xs text-stone-500">Available on packages over ₹10,000 with major bank cards.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/90 text-center space-y-1.5">
                <span className="font-mono text-xl font-bold text-slate-900 block">5 Branch Roaming</span>
                <p className="text-xs text-stone-500">Attend sessions seamlessly across Theni, Madurai, Chennai, etc.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/90 text-center space-y-1.5">
                <span className="font-mono text-xl font-bold text-slate-900 block">Family Transferable</span>
                <p className="text-xs text-stone-500">Transfer unused sessions to direct family members anytime.</p>
              </div>
            </div>

            {/* PRICING FAQS */}
            <div className="mt-20 max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                  Transparency First
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  Billing & Consultation FAQs
                </h3>
              </div>

              <div className="space-y-4 pt-4">
                {pricingFaqs.map((faq, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-start space-x-2">
                      <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-stone-600 pl-6 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-14 px-4 sm:px-8 bg-[#0c2a23] text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-serif text-2xl font-bold">Have questions about payment or packages?</h3>
              <p className="text-xs text-stone-300">
                Call our central desk directly at +91 98450 11223 or speak with a front desk counselor.
              </p>
            </div>
            <Link
              href="/book"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all shrink-0"
            >
              Book In-Clinic Consultation
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
