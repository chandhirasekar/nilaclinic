'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Calendar, CheckCircle2, ArrowLeftRight, ShieldCheck } from 'lucide-react';

export interface CaseStudyData {
  id: string;
  title: string;
  category: 'Skin' | 'Hair';
  patientProfile: string;
  condition: string;
  protocol: string;
  sessions: string;
  duration: string;
  doctor: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeImage: string;
  afterImage: string;
  clinicalNotes: string;
}

export const sampleCaseStudies: CaseStudyData[] = [
  {
    id: 'acne-scar-rf',
    title: 'Acne Scars & Texture Smoothing',
    category: 'Skin',
    patientProfile: 'Male, 26 yrs · Deep Atrophic Acne Scars',
    condition: 'Deep rolling and ice-pick acne scars on cheeks',
    protocol: 'RF Microneedling & Cannula Subcision',
    sessions: '4 Sessions',
    duration: '16 Weeks',
    doctor: 'Dr. Anitha Ramachandran (MD DVL)',
    beforeLabel: 'Baseline (Day 0)',
    afterLabel: 'Post Session 4',
    beforeImage: '/images/results/acne-before.jpg',
    afterImage: '/images/results/acne-after.jpg',
    clinicalNotes:
      'Substantial collagen remodeling achieved with over 75% elevation of scar floors and smooth, even skin texture.',
  },
  {
    id: 'hair-prp-regrowth',
    title: 'Hair Thinning & Scalp Density',
    category: 'Hair',
    patientProfile: 'Male, 31 yrs · Crown & Hairline Thinning',
    condition: 'Early-stage hair thinning and excessive daily hair fall',
    protocol: 'High-Yield Autologous PRP + Scalp Peptides',
    sessions: '6 Sessions',
    duration: '24 Weeks',
    doctor: 'Dr. Rajesh Varma (Trichologist)',
    beforeLabel: 'Baseline Presentation',
    afterLabel: 'Post 6 Months',
    beforeImage: '/images/results/hair-before.jpg',
    afterImage: '/images/results/hair-after.jpg',
    clinicalNotes:
      'Visible reversal of hair thinning with significant increase in terminal hair density and follicle strength.',
  },
  {
    id: 'melasma-qswitch',
    title: 'Melasma & Pigmentation Clearance',
    category: 'Skin',
    patientProfile: 'Female, 38 yrs · Cheek Melasma',
    condition: 'Stubborn dark melasma patches on cheekbones',
    protocol: 'Q-Switch Nd:YAG Laser Toning',
    sessions: '5 Sessions',
    duration: '12 Weeks',
    doctor: 'Dr. Priya Dharshini (Laser Specialist)',
    beforeLabel: 'Pre-Treatment',
    afterLabel: 'Post 5 Sessions',
    beforeImage: '/images/treatments/chemical-peel.jpg',
    afterImage: '/images/treatments/q-switch-laser.jpg',
    clinicalNotes:
      'Over 80% clearance of deep pigmentation without any rebound darkening or skin irritation.',
  },
  {
    id: 'laser-hair-reduction',
    title: 'Facial Hair Reduction',
    category: 'Skin',
    patientProfile: 'Female, 27 yrs · Chin & Jawline Hair',
    condition: 'Thick, coarse hormonal facial hair',
    protocol: 'Triple Wavelength Diode Laser with Sapphire Cooling',
    sessions: '6 Sessions',
    duration: '20 Weeks',
    doctor: 'Dr. Priya Dharshini (Laser Specialist)',
    beforeLabel: 'Pre-Laser Baseline',
    afterLabel: 'Post 6 Sessions',
    beforeImage: '/images/treatments/rf-microneedling.jpg',
    afterImage: '/images/treatments/diode-hair-reduction.jpg',
    clinicalNotes:
      'Over 90% permanent hair reduction with smooth, razor-bump-free skin.',
  },
];

export default function BeforeAfterSlider({ caseStudy = sampleCaseStudies[0] }: { caseStudy?: CaseStudyData }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Case Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {caseStudy.category === 'Hair' ? 'Hair Treatment' : 'Skin Treatment'}
            </span>
            <span className="text-xs text-slate-500 font-medium">{caseStudy.patientProfile}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{caseStudy.title}</h3>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 font-medium">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Protocol</span>
            <span className="font-semibold text-slate-800 text-xs">{caseStudy.sessions}</span>
          </div>
          <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 font-medium">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Duration</span>
            <span className="font-semibold text-slate-800 text-xs">{caseStudy.duration}</span>
          </div>
        </div>
      </div>

      {/* Interactive Slider Visual Arena */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full h-72 sm:h-88 md:h-96 select-none cursor-ew-resize overflow-hidden bg-slate-950"
      >
        {/* AFTER Container (Full background image) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={caseStudy.afterImage}
            alt={`${caseStudy.title} - After treatment`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* After Badge */}
          <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider border border-emerald-400/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>After: {caseStudy.afterLabel || 'Result'}</span>
          </div>
        </div>

        {/* BEFORE Container (Clipped to sliderPosition) */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl z-10"
        >
          {/* Inner image container with fixed width matching parent */}
          <div
            className="relative h-full"
            style={{
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              minWidth: '320px',
            }}
          >
            <img
              src={caseStudy.beforeImage}
              alt={`${caseStudy.title} - Before treatment`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

            {/* Before Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider border border-slate-600/50 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>Before: {caseStudy.beforeLabel || 'Baseline'}</span>
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute inset-y-0 -ml-4 w-8 flex items-center justify-center pointer-events-none z-20"
        >
          <div className="w-7 h-7 rounded-full bg-white text-emerald-700 shadow-xl border-2 border-emerald-600 flex items-center justify-center cursor-ew-resize">
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Bottom Drag Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-3 py-1 rounded-full border border-slate-700 shadow-xs pointer-events-none z-10 flex items-center space-x-1.5">
          <ArrowLeftRight className="w-3 h-3 text-emerald-400" />
          <span>DRAG SLIDER TO COMPARE</span>
        </div>
      </div>

      {/* Case Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-900">Physician:</span>
          <span className="text-slate-700">{caseStudy.doctor}</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-snug">
          {caseStudy.clinicalNotes}
        </p>
      </div>
    </div>
  );
}
