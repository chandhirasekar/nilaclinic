'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { PublicBranch } from '@/lib/publicData';

interface ContactInquiryFormProps {
  branches: PublicBranch[];
}

export default function ContactInquiryForm({ branches }: ContactInquiryFormProps) {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBranch, setFormBranch] = useState(branches[0]?.name || 'Theni (Main Branch)');
  const [formConcern, setFormConcern] = useState('Skin Treatment');
  const [formMessage, setFormMessage] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setFormSent(true);
    }, 600);
  };

  if (formSent) {
    return (
      <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-3 max-w-md mx-auto">
        <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Inquiry Received</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Thank you, <strong>{formName}</strong>. Our medical desk at {formBranch} will contact you shortly at <strong>{formPhone}</strong>.
        </p>
        <button
          onClick={() => setFormSent(false)}
          className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleContactSubmit} className="bg-slate-50 p-6 sm:p-7 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
          <input
            type="tel"
            required
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="+91 98450 XXXXX"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Treatment Category *</label>
          <select
            value={formConcern}
            onChange={(e) => setFormConcern(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600 cursor-pointer"
          >
            <option value="Skin Treatment">Skin Treatment (Acne, Scars, Melasma, Laser)</option>
            <option value="Hair Treatment">Hair Treatment (Hair Fall, Thinning, PRP)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Clinic Branch *</label>
          <select
            value={formBranch}
            onChange={(e) => setFormBranch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600 cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.code} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Your Clinical Question or Symptoms *</label>
        <textarea
          rows={3}
          required
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
          placeholder="Describe your skin or hair concern..."
          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-emerald-600"
        />
      </div>

      <div className="pt-2 text-right">
        <button
          type="submit"
          disabled={isSending}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSending ? 'Sending...' : 'Submit Inquiry'}</span>
        </button>
      </div>
    </form>
  );
}

