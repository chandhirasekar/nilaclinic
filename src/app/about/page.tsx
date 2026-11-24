import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { getPublicClinicBranches, getPublicDoctors } from '@/lib/publicData';

export const revalidate = 60;

export default async function AboutPage() {
  const [branches, doctors] = await Promise.all([
    getPublicClinicBranches(),
    getPublicDoctors(),
  ]);

  const clinicFacilities = [
    {
      title: 'NABH-Standard Reception & Lounge',
      description: 'Sterile air handling, transparent electronic billing, and comfortable waiting lounges.',
      image: '/images/clinic/reception.jpg',
      tag: 'Main Reception',
    },
    {
      title: 'Class 4 Laser Surgery Suite',
      description: 'Dedicated non-reflective laser bays with Class B autoclave sterilization and wavelength-specific patient eye shields.',
      image: '/images/clinic/laser-suite.jpg',
      tag: 'Laser Bay',
    },
    {
      title: 'Diagnostic Trichoscopy & Skin Cabin',
      description: 'Equipped with 60x polarized Wood’s lamp dermascopes and computerized hair video trichoscopy.',
      image: '/images/clinic/consultation.jpg',
      tag: 'Consultation Suite',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar branches={branches} />

      <main className="grow">
        {/* About Hero with Real Clinic Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/clinic/reception.jpg"
              alt="About Nila Clinic"
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
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Established 2018 in Theni, Tamil Nadu</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                About Nila Clinic
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Dedicated exclusively to medical Skin & Hair treatments. Grounded in scientific diagnostic protocols, certified medical doctors, and transparent pricing across {branches.length} centers in Tamil Nadu & Puducherry.
              </p>
            </div>
          </div>
        </section>

        {/* CLINIC STORY & CHARTER */}
        <section className="py-16 px-4 sm:px-8 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
                Our Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Specialized Skin & Hair Care Grounded in Medicine
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  Founded in 2018 by Dr. Anitha Ramachandran in Theni, Nila Clinic was created to bridge the gap between sterile hospital OPDs and unregulated commercial beauty salons.
                </p>
                <p>
                  We focus exclusively on <strong>Dermatological Skin Care</strong> and <strong>Follicular Hair Restoration</strong>. Every consultation, diagnostic assessment, and laser pulse is governed by board-certified doctors who refuse corporate sales quotas.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-3 gap-4 border-t border-slate-200 text-slate-800">
                <div>
                  <span className="font-mono text-xl sm:text-2xl font-bold block text-slate-900">{branches.length}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Clinic Centers</span>
                </div>
                <div>
                  <span className="font-mono text-xl sm:text-2xl font-bold block text-slate-900">10,000+</span>
                  <span className="text-[11px] text-slate-500 font-medium">Treated Patients</span>
                </div>
                <div>
                  <span className="font-mono text-xl sm:text-2xl font-bold block text-slate-900">100%</span>
                  <span className="text-[11px] text-slate-500 font-medium">Doctor Supervised</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 text-white p-7 rounded-lg space-y-4 shadow-xl border border-slate-800">
              <h3 className="text-xl font-bold">The Nila Clinical Charter</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Diagnosis First:</strong>
                    Wood’s lamp or digital trichoscopy evaluation before initiating any treatment.
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Zero Commission Quotas:</strong>
                    Salaried medical professionals who recommend only what you medically need.
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">Safety on Indian Skin:</strong>
                    Mandatory 48-hour patch tests and calibrated Class 4 lasers for South Asian skin.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CLINICAL FACILITIES */}
        <section className="py-16 px-4 sm:px-8 border-b border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-10">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Sterile Environment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Clinical Facilities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clinicFacilities.map((fac) => (
                <div key={fac.title} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="relative h-52 w-full overflow-hidden bg-slate-200">
                    <Image
                      src={fac.image}
                      alt={fac.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10">
                      {fac.tag}
                    </div>
                  </div>
                  <div className="p-5 space-y-1.5 grow">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{fac.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{fac.description}</p>
                  </div>
                  <div className="px-5 pb-4 text-[11px] text-emerald-600 font-semibold border-t border-slate-100 pt-2">
                    Standardized across all {branches.length} centers
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MEDICAL FACULTY */}
        <section id="doctors" className="py-16 px-4 sm:px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto space-y-10">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Medical Leadership
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Board-Certified Doctors
              </h2>
            </div>

            <div className="space-y-6">
              {doctors.map((doc) => (
                <div key={doc.name} className="bg-slate-50 rounded-lg border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-200 shadow-xs">
                    <Image
                      src={doc.image}
                      alt={doc.name}
                      fill
                      unoptimized={Boolean(doc.image && (doc.image.startsWith('data:') || doc.image.startsWith('http')))}
                      sizes="(max-width: 640px) 112px, 144px"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="grow space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                        <span className="text-xs font-semibold text-emerald-600">{doc.role}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-xs font-mono font-medium border border-slate-200 self-start sm:self-center">
                        {doc.regNo}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{doc.bio || doc.focus}</p>

                    {doc.focusAreas && doc.focusAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {doc.focusAreas.map((f) => (
                          <span key={f} className="text-[11px] bg-white text-emerald-800 px-2.5 py-0.5 rounded-lg border border-slate-200 font-medium">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <Link
                        href={`/book?doctor=${encodeURIComponent(doc.name)}`}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book OPD with {doc.name.split(' ')[1] || doc.name}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer branches={branches} />
    </div>
  );
}
