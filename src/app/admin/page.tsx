'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClinic } from '@/context/ClinicContext';

export default function AdminRootRedirect() {
  const router = useRouter();
  const { user } = useClinic();

  useEffect(() => {
    if (user?.role === 'doctor') {
      router.replace('/admin/doctor');
    } else if (user?.role === 'staff') {
      router.replace('/admin/pos');
    } else {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
      Redirecting to your workspace...
    </div>
  );
}
