import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import PricingClient from '@/components/public/PricingClient';
import { getPublicTreatments, getPublicClinicBranches } from '@/lib/publicData';

export const revalidate = 60;

export default async function PricingPage() {
  const [treatments, branches] = await Promise.all([
    getPublicTreatments(),
    getPublicClinicBranches(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar branches={branches} />

      <main className="grow">
        {/* Pricing Hero with Clinic Reception Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/clinic/reception.jpg"
              alt="Transparent Medical Billing Desk"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-xs">
                <span>Transparent Medical Billing</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Treatment Pricing & Curated Courses
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Standardized treatment fees across all {branches.length} Nila Clinic centers. All prices include consumables, medical numbing, and doctor evaluations with zero hidden add-ons.
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Pricing Content */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <PricingClient treatments={treatments} />
          </div>
        </section>
      </main>

      <Footer branches={branches} />
    </div>
  );
}
