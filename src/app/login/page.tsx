'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, ShieldCheck, Stethoscope, Users, Building2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Role tab state for clear guidance
  const [activeRoleTab, setActiveRoleTab] = useState<'admin' | 'doctor' | 'staff'>('admin');

  // Input states
  const [email, setEmail] = useState('admin@nilaclinic.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Role Presets & Explanations (FR-02, BR-03, Bug 4, Bug 7, Bug 10)
  const rolePresets = {
    admin: {
      title: 'Clinic Administrator',
      subtitle: 'Complete clinic control across all 5 branches',
      badge: 'Admin Access',
      email: 'admin@nilaclinic.com',
      password: 'admin',
      landingPage: '/admin/dashboard',
      color: 'emerald',
      features: ['Store Master & Branch Management', 'User Roles & Store Assignments', 'Consolidated Multi-Store Dashboard', 'Service & Product Masters'],
    },
    doctor: {
      title: 'Attending Doctor / Specialist',
      subtitle: 'Clinical Queue, Patient Examination & Rx',
      badge: 'Doctor Access (Privacy Protected)',
      email: 'doctor.theni@nilaclinic.com',
      password: 'doctor',
      landingPage: '/admin/doctor',
      color: 'sky',
      features: ['Patient Consultation Queue', 'Clinical Notes & Digital Rx', 'Patient Treatment History', 'Rule BR-03: Zero revenue/billing visibility'],
    },
    staff: {
      title: 'Reception & Billing Staff',
      subtitle: 'Walk-in registration, Appointments & Quick Sale POS',
      badge: 'Front Desk Access',
      email: 'staff.theni@nilaclinic.com',
      password: 'staff',
      landingPage: '/admin/dashboard',
      color: 'teal',
      features: ['Quick Sale POS & Split Billing', 'Customer Registration & Search', 'Appointment Scheduling & Calendar', 'Doctor Consultation Bill Collection'],
    },
  };

  const handleSelectRoleTab = (role: 'admin' | 'doctor' | 'staff') => {
    setActiveRoleTab(role);
    setEmail(rolePresets[role].email);
    setPassword(rolePresets[role].password);
    setError('');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        // Save authenticated user profile in storage
        localStorage.setItem('nilaclinic_user', JSON.stringify(data.user));

        // Route to the appropriate role-based landing page
        if (data.user.role === 'doctor') {
          router.push('/admin/doctor');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const currentPreset = rolePresets[activeRoleTab];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 relative font-sans text-slate-800">
      {/* Top minimal header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <img src="/logo.png" alt="Nila Clinic Logo" className="h-9 w-auto object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-lg leading-none">Nila Clinic</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mt-0.5">
              Skin & Hair Care
            </span>
          </div>
        </Link>
        <Link href="/" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Nila Clinic Logo" className="h-12 w-auto mx-auto mb-2 object-contain" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Login to Nila Clinic</h1>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Select your role below or enter your registered clinic credentials
            </p>
          </div>

          {/* Role Tabs for Crystal Clear Guidance (Fixes Bug 4, 7, 10) */}
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
              Choose Role to Sign In:
            </span>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className={`py-2 px-3 rounded-xl font-bold text-sm flex flex-col items-center justify-center space-y-1 transition-all ${
                  activeRoleTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoleTab('doctor')}
                className={`py-2 px-3 rounded-xl font-bold text-sm flex flex-col items-center justify-center space-y-1 transition-all ${
                  activeRoleTab === 'doctor'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Stethoscope className="w-5 h-5" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoleTab('staff')}
                className={`py-2 px-3 rounded-xl font-bold text-sm flex flex-col items-center justify-center space-y-1 transition-all ${
                  activeRoleTab === 'staff'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Staff / Frontdesk</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Card */}
          <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-sm">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-800">{currentPreset.title}</span>
                <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {currentPreset.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Preset: <code className="font-mono text-slate-800">{currentPreset.email}</code> / <code className="font-mono text-slate-800">{currentPreset.password}</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail(currentPreset.email);
                setPassword(currentPreset.password);
                handleLogin();
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs whitespace-nowrap"
            >
              1-Click Sign In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Custom Credentials Form (Works for Chandru, Custom Staff, or Admin) */}
          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Address or Username <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 text-sm font-medium outline-none transition"
                placeholder="e.g. chandru@gmail.com or admin@nilaclinic.com"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 text-sm font-medium outline-none transition pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In as {currentPreset.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Role Feature Guide */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 font-medium">
            <span className="font-bold text-slate-800 uppercase tracking-wider block text-xs">
              Access scope for this role:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {currentPreset.features.map((feat, i) => (
                <div key={i} className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500 font-medium border-t border-slate-200">
        Nila Clinic Management Portal • Dermatology, Aesthetic & Hair Care
      </footer>
    </div>
  );
}
