'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  Clock,
  MapPin,
  Calendar,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentBranch?: string;
  onBranchChange?: (branch: string) => void;
}

export default function Navbar({ currentBranch = 'Theni Main Branch', onBranchChange }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(currentBranch);

  const branches = [
    { name: 'Theni Main Branch', address: 'Theni Main Rd', phone: '+91 98450 11223' },
    { name: 'Madurai City Outlet', address: 'West Veli St', phone: '+91 98450 44556' },
    { name: 'Chennai Laser Hub', address: 'Anna Salai, Thousand Lights', phone: '+91 98450 77889' },
    { name: 'Coimbatore Center', address: 'Avinashi Rd, Peelamedu', phone: '+91 98450 88991' },
    { name: 'Trichy Branch', address: 'Thillai Nagar Main Rd', phone: '+91 98450 99002' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    setBranchDropdownOpen(false);
    if (onBranchChange) onBranchChange(branchName);
  };

  const navLinks = [
    { label: 'Treatments', href: '/treatments' },
    { label: 'Clinical Results', href: '/results' },
    { label: 'Specialists & Doctors', href: '/about#doctors' },
    { label: 'Pricing & Packages', href: '/pricing' },
    { label: 'About Us', href: '/about' },
    { label: 'Branches & Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Clinical Announcement Bar */}
      <div className="bg-[#0c2a23] text-emerald-100/90 text-xs py-2 px-4 sm:px-8 border-b border-emerald-950 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Quick Location & Hours */}
          <div className="flex items-center space-x-6 text-[11px] sm:text-xs">
            {/* Branch Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center space-x-1.5 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Select Clinic Branch"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold underline decoration-emerald-500/40 underline-offset-2">
                  {selectedBranch}
                </span>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </button>

              {branchDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">
                    Select Your Nearest Clinic
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => handleSelectBranch(b.name)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors ${
                        selectedBranch === b.name
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400">{b.address} · {b.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden md:inline-flex items-center text-emerald-200/80">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Mon - Sun: 9:00 AM - 8:30 PM (OPD & Laser)
            </span>
          </div>

          {/* Right: Direct Medical Helpline & Staff Portal */}
          <div className="flex items-center space-x-4 text-[11px] sm:text-xs">
            <span className="hidden lg:inline text-emerald-300/70">
              Tamil Nadu Medical Council Reg. #89234
            </span>
            <span className="hidden lg:inline text-emerald-800">|</span>
            <a
              href="tel:+919845011223"
              className="flex items-center text-emerald-300 hover:text-white font-bold transition-colors"
            >
              <Phone className="w-3 h-3 mr-1 text-emerald-400" />
              <span>+91 98450 11223</span>
            </a>
            <span className="text-emerald-800">|</span>
            <Link
              href="/login"
              className="text-emerald-300/80 hover:text-white font-medium transition-colors"
            >
              Staff Portal →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/90 py-3'
            : 'bg-[#faf9f5]/95 backdrop-blur-md border-b border-stone-200/60 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Clinic Brand Mark */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0c2a23] flex items-center justify-center text-white font-bold text-lg shadow-sm border border-emerald-950 group-hover:scale-[1.02] transition-transform">
              <span className="tracking-tighter">N</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
                  NILA CLINIC
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  EST. 2018
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-wide block uppercase">
                Dermatology · Laser · Trichology
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold uppercase tracking-wider text-slate-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors py-1 relative hover:text-emerald-800 ${
                    isActive ? 'text-emerald-900 font-bold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-700 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <Link
              href="/book"
              className="px-4 py-2.5 sm:px-5 sm:py-2.5 bg-[#0c2a23] hover:bg-[#123e34] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center space-x-2 border border-emerald-950"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>Book Consultation</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-stone-100 rounded-xl transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-stone-200 px-6 py-6 animate-in slide-in-from-top-4 duration-200">
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Selected Branch
                </span>
                <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>{selectedBranch}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">Open Today</span>
                </div>
              </div>

              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm font-medium text-slate-800 hover:text-emerald-800 border-b border-stone-100"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </nav>

              <div className="pt-2 flex flex-col space-y-2.5">
                <Link
                  href="/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-[#0c2a23] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs"
                >
                  Book In-Clinic Consultation
                </Link>
                <a
                  href="tel:+919845011223"
                  className="w-full text-center py-3 bg-stone-100 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Call Doctor Helpline: +91 98450 11223</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
