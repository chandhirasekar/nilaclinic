import React, { Suspense } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BookingContent from '@/components/public/BookingContent';
import { getPublicClinicBranches } from '@/lib/publicData';

export const revalidate = 60;

export default async function BookingPage() {
  const branches = await getPublicClinicBranches();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      <Navbar branches={branches} />
      <main className="grow">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading booking interface...</div>}>
          <BookingContent initialBranches={branches} />
        </Suspense>
      </main>
      <Footer branches={branches} />
    </div>
  );
}
