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
} from 'lucide-react';

import { PublicBranch } from '@/lib/publicData';

interface NavbarProps {
  currentBranch?: string;
  onBranchChange?: (branch: string) => void;
  branches?: PublicBranch[];
}

export default function Navbar({ currentBranch = 'Theni Main Branch', onBranchChange, branches: propBranches }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(currentBranch);

  const defaultBranches = [
    { name: 'Theni Main Branch', address: 'Theni Main Rd', phone: '+91 98450 11223' },
  ];

  const branches = propBranches && propBranches.length > 0 ? propBranches : defaultBranches;

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
    { label: 'Skin & Hair Treatments', href: '/treatments' },
    // { label: 'Results', href: '/results' },
    { label: 'Specialists', href: '/about#doctors' },
    // { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Branches', href: '/contact' },
  ];

  return (
    <>
      {/* Top Clinical Announcement Bar (Full Width) */}
      <div className="w-full bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 lg:px-12 border-b border-slate-800 font-medium">
        <div className="w-full flex flex-col sm:flex-row  ">
          {/* Left: Branch Selector & Hours */}

          {/* Right: Direct Medical Helpline & Staff Portal */}
          <div className="flex items-center justify-between w-full space-x-4 text-[11px] sm:text-xs">
            {/* <span className="hidden lg:inline text-slate-400">
              TNMC Reg. #89234
            </span>
            <span className="hidden lg:inline text-slate-700">|</span> */}
            <div className='flex items-center gap-[10px]'>
              <span className="hidden md:inline-flex items-center text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Mon - Sun: 9:00 AM - 8:30 PM
              </span>
              <span className="hidden md:inline-flex text-slate-700">|</span>
              <a
                href="tel:+919845011223"
                className="flex items-center text-emerald-400 hover:text-white font-bold transition-colors"
              >
                <Phone className="w-3 h-3 mr-1" />
                <span>+91 98450 11223</span>
              </a>
            </div>
            {/* <span className="text-slate-700">|</span> */}
            <Link
              href="/login"
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Staff Portal Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header (Full Width) */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200 py-3'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3.5'
          }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Clinic Brand Mark with Original Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs group-hover:border-emerald-300 transition-colors">
              <img
                src="/logo.png"
                alt="Nila Clinic Logo"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight block leading-none">
                  NILA CLINIC
                </span>
                {/* <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  EST. 2018
                </span> */}
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">
                Skin & Hair Care Center
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
                  className={`transition-colors py-1 relative hover:text-emerald-600 ${isActive ? 'text-emerald-600 font-bold' : 'text-slate-600'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Desktop & Tablet: Full Button */}
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition-all whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>

            {/* Mobile: Compact Calendar Icon Button (prevents 2-line wrap and header overflow) */}
            <Link
              href="/book"
              aria-label="Book Appointment"
              className="sm:hidden p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center shrink-0"
            >
              <Calendar className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay (Full Width) */}
        {mobileMenuOpen && (
          <div className="w-full lg:hidden bg-white border-b border-slate-200 px-6 sm:px-8 lg:px-12 py-6 animate-in slide-in-from-top-4 duration-200">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Selected Branch
                </span>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{selectedBranch}</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">Open Today</span>
                </div>
              </div>

              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm font-medium text-slate-800 hover:text-emerald-600 border-b border-slate-100"
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
                  className="w-full text-center py-3 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs"
                >
                  Book In-Clinic Consultation
                </Link>
                <a
                  href="tel:+919845011223"
                  className="w-full text-center py-3 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
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
