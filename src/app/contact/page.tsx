import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import ContactInquiryForm from '@/components/public/ContactInquiryForm';
import { getPublicClinicBranches } from '@/lib/publicData';

export const revalidate = 60;

export default async function ContactPage() {
  const branches = await getPublicClinicBranches();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar branches={branches} />

      <main className="grow">
        {/* Contact Hero with Regional Clinic Hubs Background Image */}
        <section className="relative py-16 px-4 sm:px-8 border-b border-slate-800 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/clinic/reception.jpg"
              alt="Nila Clinic Regional Centers"
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
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{branches.length} Regional Centers Across Tamil Nadu & Puducherry</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Clinic Locations & Direct Contact
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Visit our specialized Skin & Hair clinics across Tamil Nadu and Puducherry. All branches feature certified laser suites, sterile procedure rooms, and attending specialists.
              </p>
            </div>
          </div>
        </section>

        {/* Central Communications Bar */}
        <section className="bg-white border-b border-slate-200 py-5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor Booking Desk</span>
                <a href="tel:+919845011223" className="font-mono font-bold text-slate-900 text-sm hover:underline">
                  +91 98450 11223
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Support</span>
                <a href="mailto:care@nilaclinic.com" className="font-bold text-slate-900 text-sm hover:underline">
                  care@nilaclinic.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Hours</span>
                <span className="font-semibold text-slate-900 text-sm block">9:00 AM – 8:00 PM Daily</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Branches Directory */}
        <section className="py-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our {branches.length} Clinic Branches
              </h2>
            </div>

            <div className="space-y-4">
              {branches.map((b) => (
                <div
                  key={b.code}
                  className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between"
                >
                  <div className="w-full md:w-52 h-40 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative">
                    <Image
                      src={b.image}
                      alt={b.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 208px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold z-10">
                      {b.code}
                    </div>
                  </div>

                  <div className="space-y-2 grow">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-slate-900">{b.name}</h3>
                        {b.isMain && (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                            Headquarters
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 flex items-start space-x-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b.address}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Attending Specialist</span>
                        <span className="text-slate-900 font-semibold">{b.doctor}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Working Hours</span>
                        <span className="text-slate-700 font-medium">{b.hours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-48 shrink-0 pt-2 md:pt-0">
                    <Link
                      href={`/book?branch=${b.code}`}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all text-center shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </Link>

                    <a
                      href={`tel:${b.phone.replace(/\s+/g, '')}`}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Patient Inquiry Form */}
        <section className="py-12 px-4 sm:px-8 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
                Direct Contact
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Send a Message to Our Clinical Desk
              </h2>
              <p className="text-slate-500 text-xs">
                Have a query regarding a skin or hair concern? Our clinical team across our {branches.length} branches will respond promptly.
              </p>
            </div>

            <ContactInquiryForm branches={branches} />
          </div>
        </section>
      </main>

      <Footer branches={branches} />
    </div>
  );
}
