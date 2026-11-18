'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Calendar, CheckCircle2, ShieldCheck, ArrowLeftRight } from 'lucide-react';

export interface CaseStudyData {
  id: string;
  title: string;
  category: 'Skin' | 'Hair' | 'Laser' | 'Scars';
  patientProfile: string;
  condition: string;
  protocol: string;
  sessions: string;
  duration: string;
  doctor: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeBg: string;
  afterBg: string;
  clinicalNotes: string;
}

export const sampleCaseStudies: CaseStudyData[] = [
  {
    id: 'acne-scar-rf',
    title: 'Severe Grade 3 Atrophic Scars & Erythema',
    category: 'Scars',
    patientProfile: 'Male, 26 yrs · Fitzpatrick Skin Type IV',
    condition: 'Deep rolling and ice-pick acne scars with persistent post-inflammatory erythema',
    protocol: 'Subcision with Blunt Cannula + 4 Sessions Monopolar RF Microneedling & Hyaluronic Matrix',
    sessions: '4 In-Clinic Sessions',
    duration: '16 Weeks Follow-up',
    doctor: 'Dr. Anitha Ramachandran (MD DVL)',
    beforeLabel: 'Baseline (Day 0)',
    afterLabel: 'Post Session 4 (Week 16)',
    beforeBg: 'from-amber-900/30 via-stone-800 to-stone-900',
    afterBg: 'from-emerald-950/40 via-stone-800 to-stone-900',
    clinicalNotes: 'Significant dermal collagen remodeling achieved; over 75% elevation of rolling scar floor and resolution of macular erythema without post-inflammatory hyperpigmentation.',
  },
  {
    id: 'hair-prp-regrowth',
    title: 'Androgenetic Alopecia (Norwood Scale Grade 3)',
    category: 'Hair',
    patientProfile: 'Male, 31 yrs · Vertex & Frontal Recession',
    condition: 'Progressive hair thinning, follicular miniaturization along the crown and anterior hairline',
    protocol: 'Autologous High-Yield PRP (3200 RPM double spin) + Scalp Microneedling with Copper Tripeptide-1',
    sessions: '6 Sessions (Monthly Interval)',
    duration: '24 Weeks Evaluation',
    doctor: 'Dr. Rajesh Varma (Trichology Fellow)',
    beforeLabel: 'Baseline Presentation',
    afterLabel: 'Post 6 Months Protocol',
    beforeBg: 'from-orange-950/30 via-stone-800 to-stone-900',
    afterBg: 'from-teal-950/40 via-stone-800 to-stone-900',
    clinicalNotes: 'Trichoscopy revealed terminal hair density increase from 112 hairs/cm² to 164 hairs/cm² with marked reduction in follicular miniaturization ratio.',
  },
  {
    id: 'melasma-qswitch',
    title: 'Dermal & Epidermal Mixed Melasma',
    category: 'Skin',
    patientProfile: 'Female, 38 yrs · Fitzpatrick Skin Type IV',
    condition: 'Refractory bilateral malar hyperpigmentation resistant to topical hydroquinone',
    protocol: 'Low-Fluence Q-Switch Nd:YAG (1064nm) Laser Toning combined with Tranexamic Acid Topical Infusion',
    sessions: '5 Sessions (2-week interval)',
    duration: '12 Weeks Review',
    doctor: 'Dr. Priya Dharshini (Laser Specialist)',
    beforeLabel: 'Pre-Treatment Malar Pigment',
    afterLabel: 'Post 5 Sessions Toning',
    beforeBg: 'from-rose-950/30 via-stone-800 to-stone-900',
    afterBg: 'from-emerald-950/30 via-stone-800 to-stone-900',
    clinicalNotes: 'Over 80% reduction in MASI (Melasma Area and Severity Index) score without hypopigmentation or rebound darkening.',
  },
  {
    id: 'laser-hair-reduction',
    title: 'Excessive Terminal Facial Hirsutism',
    category: 'Laser',
    patientProfile: 'Female, 27 yrs · Hormonal (PCOS-associated)',
    condition: 'Coarse terminal hair growth over chin, submental area, and jawline',
    protocol: 'Triple Wavelength (755nm + 808nm + 1064nm) Diode Laser with Sapphire Contact Cooling (-5°C)',
    sessions: '6 Sessions',
    duration: '20 Weeks Progress',
    doctor: 'Dr. Priya Dharshini (Laser Specialist)',
    beforeLabel: 'Pre-Laser Baseline',
    afterLabel: 'Post 6th Session',
    beforeBg: 'from-stone-900 via-stone-800 to-stone-900',
    afterBg: 'from-emerald-950/40 via-stone-800 to-stone-900',
    clinicalNotes: 'Hair reduction exceeding 90% in targeted mandibular and mental zones, remaining fine vellus hair comfortably maintained with maintenance touch-up.',
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Case Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              {caseStudy.category} Case Study
            </span>
            <span className="text-xs text-slate-500 font-medium">{caseStudy.patientProfile}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">{caseStudy.title}</h3>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <span className="text-slate-400 block text-[10px] uppercase">Protocol</span>
            <span className="font-semibold text-slate-800">{caseStudy.sessions}</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <span className="text-slate-400 block text-[10px] uppercase">Timeline</span>
            <span className="font-semibold text-slate-800">{caseStudy.duration}</span>
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
        className="relative w-full h-80 sm:h-96 select-none cursor-ew-resize overflow-hidden bg-stone-900"
      >
        {/* AFTER Container (Full background) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-emerald-950/70 via-slate-900 to-stone-950 text-white">
          <div className="space-y-3 max-w-md">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              {caseStudy.afterLabel || 'Post-Treatment Result'}
            </span>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
              Clinical post-treatment evaluation demonstrating tissue remodeling, follicular revival, and dermal re-epithelialization following complete session adherence.
            </p>
            <div className="pt-2 text-[11px] text-emerald-300/80 font-mono">
              Signed by: {caseStudy.doctor}
            </div>
          </div>
          
          <div className="absolute top-4 right-4 bg-emerald-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/50 uppercase tracking-wider">
            After Treatment
          </div>
        </div>

        {/* BEFORE Container (Clipped to sliderPosition) */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl bg-radial from-amber-950/60 via-stone-900 to-black text-white"
        >
          {/* Inner div set to 100vw or fixed width container to prevent squash during clip */}
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="space-y-3 max-w-md">
              <div className="w-14 h-14 mx-auto rounded-full bg-stone-800/80 border border-stone-600 flex items-center justify-center text-stone-300">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-stone-800/80 text-stone-300 font-mono text-xs font-semibold uppercase tracking-wider border border-stone-600">
                {caseStudy.beforeLabel || 'Baseline (Day 0)'}
              </span>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {caseStudy.condition}
              </p>
              <div className="pt-2 text-[11px] text-stone-400 font-mono">
                Assessed at Initial Consultation
              </div>
            </div>

            <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-xs text-stone-300 text-[11px] font-bold px-3 py-1 rounded-full border border-stone-700 uppercase tracking-wider">
              Before (Baseline)
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 -ml-4 w-8 flex items-center justify-center pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-xl border-2 border-emerald-700 flex items-center justify-center text-emerald-800">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* User Hint */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] uppercase font-bold tracking-wider rounded-full border border-white/20">
            Drag Slider or Touch to Compare
          </span>
        </div>
      </div>

      {/* Clinical Notes & Verification Footer */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Dermatological Findings & Protocol Note
            </span>
            <p className="text-slate-700 leading-relaxed font-normal">
              {caseStudy.clinicalNotes}
            </p>
          </div>
          <div className="md:col-span-4 bg-white p-3 rounded-xl border border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Attending Physician</span>
              <span className="text-xs font-bold text-slate-900 block leading-tight">{caseStudy.doctor}</span>
              <span className="text-[10px] text-emerald-600 font-medium">Verified In-Clinic Case</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
