'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Award,
  ArrowRight,
} from 'lucide-react';

export default function Footer() {
  const branches = [
    {
      city: 'Theni (Main Branch)',
      address: '42, Theni Main Road, Theni - 625531',
      phone: '+91 98450 11223',
      leadDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
      hours: 'Mon-Sat: 9AM - 8PM | Sun: 9AM - 2PM',
    },
    {
      city: 'Madurai City Outlet',
      address: '18, West Veli Street, Madurai - 625001',
      phone: '+91 98450 44556',
      leadDoctor: 'Dr. Rajesh Varma (Trichology Fellow)',
      hours: 'Mon-Sun: 9AM - 8PM',
    },
    {
      city: 'Chennai Laser Hub',
      address: '7, Anna Salai, Thousand Lights, Chennai - 600002',
      phone: '+91 98450 77889',
      leadDoctor: 'Dr. Priya Dharshini (Laser Specialist)',
      hours: 'Mon-Sun: 10AM - 8:30PM (Tue Off)',
    },
    {
      city: 'Coimbatore Aesthetic Center',
      address: '104, Avinashi Road, Peelamedu, Coimbatore - 641004',
      phone: '+91 98450 88991',
      leadDoctor: 'Dr. R. Kavitha (Consultant Dermatologist)',
      hours: 'Mon-Sat: 9:30AM - 8PM',
    },
    {
      city: 'Trichy Clinical Center',
      address: '25, Thillai Nagar Main Road, Trichy - 620018',
      phone: '+91 98450 99002',
      leadDoctor: 'Dr. S. Karthik (Aesthetic Practitioner)',
      hours: 'Mon-Sun: 9AM - 7:30PM (Wed Off)',
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Clinic Trust & Quality Assurance Band */}
      <div className="border-b border-slate-800 bg-slate-950 py-8 px-4 sm:px-8 lg:px-12">
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 text-slate-200">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">US-FDA Cleared Technology</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                All lasers and clinical delivery devices comply with international safety benchmarks.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Board-Certified Specialists</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Evaluations and prescriptions performed only by registered MD & DVL dermatologists.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Mandatory Patch Testing</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                48-hour dermal sensitivity test prior to any chemical resurfacing or high-fluence laser session.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Zero Gimmick Guarantee</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Evidence-based protocols with upfront pricing and realistic outcome projections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Story Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded-xl border border-slate-800 shadow-2xs">
                <img
                  src="/logo.png"
                  alt="Nila Clinic Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
                  NILA CLINIC
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                  Skin & Hair Care Center
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Founded in Theni and expanded across Tamil Nadu, Nila Clinic delivers medical-grade dermatological care, laser aesthetic therapies, and trichological hair restoration. Evidence-based clinical science without exaggerated claims.
            </p>

            <div className="pt-2 text-slate-400 space-y-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-semibold">TMC Reg:</span>
                <span>#89234 / 2018 (State Medical Council)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-semibold">Central Inquiries:</span>
                <a href="mailto:care@nilaclinic.com" className="hover:text-white transition-colors">
                  care@nilaclinic.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-semibold">Emergency Helpline:</span>
                <a href="tel:+919845011223" className="hover:text-white font-bold text-emerald-400 transition-colors">
                  +91 98450 11223
                </a>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/book"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Book In-Clinic Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Clinical Navigation
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/treatments" className="hover:text-emerald-400 transition-colors">
                  All Treatments & Catalog
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-emerald-400 transition-colors">
                  Clinical Case Studies
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors">
                  Transparent Pricing & Packages
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  Our Doctors & Credentials
                </Link>
              </li>
              <li>
                <Link href="/about#safety" className="hover:text-emerald-400 transition-colors">
                  Clinical Sterilization Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Clinic Locations & Hours
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-emerald-400 hover:text-white font-semibold transition-colors">
                  Doctor & Staff Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Treatment Areas Column */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Featured Protocols
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/treatments/hydra-facial" className="hover:text-emerald-400 transition-colors">
                  Hydra Facial & Infusion
                </Link>
              </li>
              <li>
                <Link href="/treatments/q-switch-laser" className="hover:text-emerald-400 transition-colors">
                  Q-Switch Nd:YAG Laser
                </Link>
              </li>
              <li>
                <Link href="/treatments/laser-hair-reduction" className="hover:text-emerald-400 transition-colors">
                  Diode Laser Hair Reduction
                </Link>
              </li>
              <li>
                <Link href="/treatments/prp-hair-restoration" className="hover:text-emerald-400 transition-colors">
                  Autologous PRP Hair Regrowth
                </Link>
              </li>
              <li>
                <Link href="/treatments/rf-microneedling" className="hover:text-emerald-400 transition-colors">
                  RF Microneedling for Scars
                </Link>
              </li>
              <li>
                <Link href="/treatments/chemical-peel" className="hover:text-emerald-400 transition-colors">
                  Dermatological Chemical Peels
                </Link>
              </li>
            </ul>
          </div>

          {/* Branch Directory Column */}
          <div className="lg:col-span-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              5 Clinic Locations Across Tamil Nadu
            </h5>
            <div className="space-y-3">
              {branches.map((b) => (
                <div key={b.city} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-white font-semibold">
                    <span>{b.city}</span>
                    <a href={`tel:${b.phone.replace(/\s+/g, '')}`} className="text-emerald-400 font-mono hover:underline">
                      {b.phone}
                    </a>
                  </div>
                  <p className="text-slate-400 mt-0.5">{b.address}</p>
                  <p className="text-emerald-400/90 text-[10px] mt-0.5">
                    Consultant: {b.leadDoctor}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Medical Regulatory Notice */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Medical Notice:</strong> Treatments and procedures listed on this site represent clinical therapies conducted under the supervision of qualified dermatologists and trichologists. Pre-procedure consultation and medical assessment are mandatory before any prescription or procedural intervention. No outcome is universally guaranteed; therapeutic trajectories depend on clinical evaluation and patient compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 gap-2">
            <span>© {new Date().getFullYear()} Nila Clinic Pvt. Ltd. All rights reserved. Registered under Clinical Establishments Act.</span>
            <div className="flex space-x-4">
              <Link href="/about" className="hover:text-slate-300">Privacy Policy</Link>
              <Link href="/about" className="hover:text-slate-300">Clinical Consent Form</Link>
              <Link href="/contact" className="hover:text-slate-300">Patient Grievance Cell</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
