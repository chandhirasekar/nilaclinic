'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Award,
  ArrowRight,
  Calendar,
  Building2,
} from 'lucide-react';

import { PublicBranch } from '@/lib/publicData';

interface FooterProps {
  branches?: PublicBranch[];
}

export default function Footer({ branches: propBranches }: FooterProps) {
  const defaultBranches = [
    {
      code: 'theni',
      city: 'Theni (Main Branch)',
      address: '42, Theni Main Road, Opp. District Court, Theni - 625531',
      phone: '+91 98450 11223',
    },
    {
      code: 'madurai',
      city: 'Madurai City Hub',
      address: '18, West Veli Street, Near Junction, Madurai - 625001',
      phone: '+91 98450 44556',
    },
    {
      code: 'chennai',
      city: 'Chennai Laser Suite',
      address: '7, Anna Salai, Thousand Lights, Chennai - 600002',
      phone: '+91 98450 77889',
    },
    {
      code: 'coimbatore',
      city: 'Coimbatore Aesthetic Center',
      address: '104, Avinashi Road, Peelamedu, Coimbatore - 641004',
      phone: '+91 98450 88991',
    },
    {
      code: 'trichy',
      city: 'Trichy Clinical Center',
      address: '25, Thillai Nagar Main Road, Trichy - 620018',
      phone: '+91 98450 99002',
    },
  ];

  const branches =
    propBranches && propBranches.length > 0
      ? propBranches.map((b) => ({
          code: b.code,
          city: b.name,
          address: b.address,
          phone: b.phone,
        }))
      : defaultBranches;

  return (
    <footer className="bg-[#070d17] text-slate-300 text-xs border-t border-slate-800/80 relative overflow-hidden">
      {/* 1. CLINICAL GOVERNANCE & SAFETY ASSURANCE BAND */}
      <div className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xs py-8 px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-2 group">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">US-FDA Cleared Class-4 Lasers</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Candela & Lutronic dual-wavelength systems calibrated for South Asian phototypes III–VI.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-2 group">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">MD & DVL Consultations</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evaluations and prescriptions performed only by registered postgraduate dermatologists.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-2 group">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">Mandatory 48-Hour Patch Test</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sensitivity test prior to any chemical resurfacing or high-fluence laser session.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-2 group">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">Transparent Pricing</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Itemized tariffs inclusive of disposables and GST with zero commercial quotas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand & Contact (4 Columns) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-xl border border-slate-700 shadow-sm shrink-0">
                <img
                  src="/logo.png"
                  alt="Nila Clinic Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                  NILA CLINIC
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-1">
                  Skin, Laser & Trichology Center
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Founded in Theni by Dr. Anitha Ramachandran (MD DVL) and expanded across 5 specialized hubs in Tamil Nadu. We practice evidence-based medical dermatology, laser therapies, and autologous hair restoration governed strictly by clinical science.
            </p>

            {/* Address & Phone */}
            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-relaxed">
                  42, Theni Main Road, Opp. District Court, Theni - 625531, Tamil Nadu
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="tel:+919845011223"
                  className="font-mono text-emerald-400 font-bold hover:underline transition-colors"
                >
                  +91 98450 11223
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="mailto:care@nilaclinic.com"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  care@nilaclinic.com
                </a>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/book"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-emerald-600/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book In-Clinic Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Protocols Column (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Protocols
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/treatments/hydra-facial" className="hover:text-emerald-400 transition-colors block">
                  HydraFacial MD Infusion
                </Link>
              </li>
              <li>
                <Link href="/treatments/q-switch-laser" className="hover:text-emerald-400 transition-colors block">
                  Q-Switch Nd:YAG Toning
                </Link>
              </li>
              <li>
                <Link href="/treatments/laser-hair-reduction" className="hover:text-emerald-400 transition-colors block">
                  Diode Laser Hair Reduction
                </Link>
              </li>
              <li>
                <Link href="/treatments/prp-hair-restoration" className="hover:text-emerald-400 transition-colors block">
                  Autologous PRP Hair Therapy
                </Link>
              </li>
              <li>
                <Link href="/treatments/rf-microneedling" className="hover:text-emerald-400 transition-colors block">
                  RF Microneedling (Scars)
                </Link>
              </li>
              <li>
                <Link href="/treatments/chemical-peel" className="hover:text-emerald-400 transition-colors block">
                  Dermal Resurfacing Peels
                </Link>
              </li>
              <li>
                <Link href="/treatments" className="text-emerald-400 hover:underline font-semibold block pt-1">
                  View All Procedures →
                </Link>
              </li>
            </ul>
          </div>

          {/* Patient Care Links (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Patient Care
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors block">
                  Medical Faculty & Credentials
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-emerald-400 transition-colors block">
                  Clinical Case Studies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors block">
                  Tariff & Billing FAQs
                </Link>
              </li>
              <li>
                <Link href="/about#safety" className="hover:text-emerald-400 transition-colors block">
                  Sterilization Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors block">
                  Clinic Hours & Map Guides
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-emerald-400 hover:text-white font-semibold transition-colors block pt-1">
                  Doctor & Staff Portal →
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Locations List (4 Columns) */}
          <div className="lg:col-span-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Our Clinic Locations</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-normal">{branches.length} Centers</span>
            </h5>

            <div className="space-y-2">
              {branches.map((b) => (
                <div
                  key={b.code}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {b.city}
                    </span>
                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="font-mono text-emerald-400 hover:underline text-[11px] font-semibold"
                    >
                      {b.phone}
                    </a>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                    {b.address}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. CLEAN BOTTOM BAR */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <span>
            © {new Date().getFullYear()} Nila Clinic Pvt. Ltd. All rights reserved.
          </span>
          <div className="flex flex-wrap gap-4 text-[11px]">
            <Link href="/about" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/about#safety" className="hover:text-slate-300 transition-colors">Safety Standards</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}