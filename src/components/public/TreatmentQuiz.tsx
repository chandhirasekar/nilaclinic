'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';

interface Recommendation {
  concernTitle: string;
  recommendedService: string;
  slug: string;
  sessions: string;
  downtime: string;
  estimatedPrice: string;
  suitableDoctor: string;
  rationale: string;
  contraindications: string;
}

export default function TreatmentQuiz() {
  const [step, setStep] = useState(1);
  const [concern, setConcern] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [skinType, setSkinType] = useState<string>('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const concernOptions = [
    {
      id: 'acne-scars',
      title: 'Acne, Scars & Redness',
      desc: 'Active breakouts, post-acne dark marks (PIH), or pitted ice-pick/rolling scars',
    },
    {
      id: 'hair-loss',
      title: 'Hair Thinning & Hair Fall',
      desc: 'Receding hairline, widening parting, excessive daily shed, or patch loss',
    },
    {
      id: 'pigmentation',
      title: 'Melasma & Pigmentation',
      desc: 'Dark patches, sun spots, tanning, or uneven facial complexion',
    },
    {
      id: 'unwanted-hair',
      title: 'Unwanted Facial or Body Hair',
      desc: 'Coarse chin/upper-lip hair, hormonal hirsutism, or full-body reduction',
    },
    {
      id: 'dullness-aging',
      title: 'Skin Dullness & Early Aging',
      desc: 'Dehydration, fine lines, congested pores, loss of firmness and radiance',
    },
  ];

  const durationOptions = [
    { id: 'recent', title: 'Recent (< 3 months)', desc: 'Newly developed issue, acute onset' },
    { id: 'moderate', title: 'Moderate (3 - 12 months)', desc: 'Persistent condition, tried general OTC products' },
    { id: 'chronic', title: 'Chronic (1+ years)', desc: 'Long-standing concern requiring structured medical intervention' },
  ];

  const skinTypeOptions = [
    { id: 'normal-dry', title: 'Normal to Dry / Sensitive', desc: 'Prone to tightness, flaking, or redness easily' },
    { id: 'oily-acne', title: 'Oily / Combination', desc: 'Excess sebum, visible pores, prone to frequent breakouts' },
    { id: 'scalp-focused', title: 'Scalp / Follicular Focus', desc: 'Concern primarily concentrated on scalp and hair follicles' },
  ];

  const calculateRecommendation = (selConcern: string, selDuration: string, selType: string) => {
    let rec: Recommendation;

    if (selConcern === 'hair-loss') {
      rec = {
        concernTitle: 'Clinical Hair Restoration Protocol',
        recommendedService: 'Autologous PRP Therapy + Scalp Peptide Infusion',
        slug: 'prp-hair-restoration',
        sessions: '4 - 6 Sessions at 4-week intervals',
        downtime: 'Zero Downtime (mild scalp sensitivity for 4 hours)',
        estimatedPrice: '₹3,200 per session / Package ₹14,999 (6 sessions)',
        suitableDoctor: 'Dr. Rajesh Varma (Trichology Fellow)',
        rationale:
          'Autologous platelet-rich plasma delivers concentrated vascular endothelial growth factors (VEGF) directly to dormant follicle bulges, reversing miniaturization in androgenetic thinning.',
        contraindications: 'Active scalp infections, severe platelet dysfunction or anticoagulant therapy.',
      };
    } else if (selConcern === 'acne-scars') {
      rec = {
        concernTitle: 'Dermal Remodeling & Scar Revision',
        recommendedService: 'Subcision + RF Microneedling & Hyaluronic Infusion',
        slug: 'rf-microneedling',
        sessions: '3 - 4 Sessions at 6-week intervals',
        downtime: '24 - 48 Hours mild erythema',
        estimatedPrice: '₹3,500 per session / Package ₹9,999 (3 sessions)',
        suitableDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
        rationale:
          'Fibrotic scar bands tethering the skin floor are mechanically released via subcision, followed by fractionated bipolar RF delivering thermal micro-coagulation to stimulate new elastin synthesis.',
        contraindications: 'Active cystic acne flare-ups or isotretinoin use within past 3 months.',
      };
    } else if (selConcern === 'pigmentation') {
      rec = {
        concernTitle: 'Targeted Melanin Fragmentation',
        recommendedService: 'Q-Switch Nd:YAG Laser Toning (1064nm)',
        slug: 'q-switch-laser',
        sessions: '4 - 6 Sessions at 2-week intervals',
        downtime: 'Zero Downtime (Immediate return to routine)',
        estimatedPrice: '₹3,500 per session / Package ₹12,999 (4 sessions)',
        suitableDoctor: 'Dr. Priya Dharshini (Laser Specialist)',
        rationale:
          'Nanosecond acoustic pulses selectively shatter dermal and epidermal melanosomes into microscopic particles without thermal damage to surrounding tissue, naturally cleared via the lymphatic system.',
        contraindications: 'Fresh active sunburn or active cold sores.',
      };
    } else if (selConcern === 'unwanted-hair') {
      rec = {
        concernTitle: 'Permanent Hair Reduction Protocol',
        recommendedService: 'Triple-Wavelength Diode Laser with Sapphire Cooling',
        slug: 'laser-hair-reduction',
        sessions: '6 - 8 Sessions at 4-6 week intervals',
        downtime: 'Zero Downtime',
        estimatedPrice: '₹2,999 (Facial) / ₹7,499 (Full Body Session)',
        suitableDoctor: 'Dr. Priya Dharshini (Laser Specialist)',
        rationale:
          'Simultaneous 755nm, 808nm, and 1064nm wavelengths safely address both coarse and fine follicles across all Fitzpatrick Indian skin types while the contact chill-tip prevents epidermal burns.',
        contraindications: 'Recent bleaching or waxing within 10 days of session.',
      };
    } else {
      rec = {
        concernTitle: 'Medical Skin Clarification & Dermal Hydration',
        recommendedService: 'Hydra Facial MD + Antioxidant Infusion',
        slug: 'hydra-facial',
        sessions: 'Single treatment for instant glow, or monthly maintenance',
        downtime: 'Zero Downtime',
        estimatedPrice: '₹2,499 per session',
        suitableDoctor: 'Dr. Anitha Ramachandran (MD DVL)',
        rationale:
          '3-step vortex extraction: gentle glycolic-salicylic peel removes dead stratum corneum, vortex suction purges follicular plugs, and micro-infusion saturates the dermis with hyaluronic acid.',
        contraindications: 'Severe open wounds, active eczema exacerbation.',
      };
    }

    setRecommendation(rec);
    setStep(4);
  };

  const resetQuiz = () => {
    setStep(1);
    setConcern('');
    setDuration('');
    setSkinType('');
    setRecommendation(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto">
      {/* Quiz Progress Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-3">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block">
            Clinical Recommendation Engine
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Find Your Individualized Protocol
          </h3>
        </div>

        {step < 4 && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span>Step {step} of 3</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-6 h-1.5 rounded-full ${
                    step >= s ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 1: Concern */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            What is your primary area of clinical or aesthetic concern?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {concernOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setConcern(opt.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  concern === opt.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-slate-900 text-sm">{opt.title}</h4>
                  {concern === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              disabled={!concern}
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <span>Next: Duration & History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Duration */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            How long has this condition been presenting?
          </p>

          <div className="space-y-3 pt-1">
            {durationOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDuration(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  duration === opt.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{opt.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {duration === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              ← Back
            </button>
            <button
              disabled={!duration}
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <span>Next: Skin Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Skin Type */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            How would you describe your dermal or scalp tolerance profile?
          </p>

          <div className="space-y-3 pt-1">
            {skinTypeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSkinType(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  skinType === opt.id
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{opt.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {skinType === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              ← Back
            </button>
            <button
              disabled={!skinType}
              onClick={() => calculateRecommendation(concern, duration, skinType)}
              className="px-6 py-3 rounded-xl bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Clinical Recommendation</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results Recommendation Card */}
      {step === 4 && recommendation && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Recommended Clinical Protocol
                </span>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {recommendation.recommendedService}
                </h4>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-center">
                Physician Supervised
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Protocol Schedule</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{recommendation.sessions}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Downtime</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{recommendation.downtime}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transparent Fee</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block">{recommendation.estimatedPrice}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wide">
                Mechanism of Action & Clinical Rationale:
              </span>
              <p className="leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                {recommendation.rationale}
              </p>
            </div>

            <div className="flex items-start space-x-2 text-[11px] text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Clinical Note:</strong> {recommendation.contraindications} A compulsory pre-procedure dermatological evaluation and 48-hour patch test is conducted prior to first session.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Assigned Consultant: <strong>{recommendation.suitableDoctor}</strong></span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <Link
                  href={`/book?service=${encodeURIComponent(recommendation.recommendedService)}`}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-md shadow-emerald-600/20"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation for this Protocol</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
