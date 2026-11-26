'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Production input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide your registered clinic email/username and password.');
      return;
    }

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
        localStorage.setItem('nilaclinic_user', JSON.stringify(data.user));
        if (data.user.role === 'doctor') {
          router.push('/admin/doctor');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials. Please verify your login details.');
      }
    } catch (err: any) {
      setError(err.message || 'Network connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex bg-slate-950 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ================= LEFT COLUMN: CLEAN LOGIN FORM ================= */}
      <div className="w-full lg:w-1/2 xl:w-5/12 h-full flex flex-col justify-between bg-white px-6 sm:px-10 xl:px-14 py-4 sm:py-6 relative z-10 shadow-2xl overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 p-1.5 flex items-center justify-center shadow-2xs group-hover:border-emerald-300 transition-all">
              <img src="/logo.png" alt="Nila Clinic" className="w-full h-auto object-contain" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base sm:text-lg leading-none tracking-tight block">Nila Clinic</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mt-0.5">
                Staff & Provider Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100"
          >
            <span>Back to Website</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Center Form Content */}
        <div className="my-auto py-3 max-w-sm w-full mx-auto space-y-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authorized Access Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">Sign In to Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Enter your clinic credentials to access appointments, patient queue, and billing.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
                  placeholder="admin@nilaclinic.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember this workstation</span>
              </label>

              <span className="text-slate-400 text-[11px] font-medium">Auto-Routed Access</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-700/25 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-1 text-center">
            <div className="inline-flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>HIPAA Compliant • 256-Bit SSL Encrypted Healthcare Portal</span>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="pt-3 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>© {new Date().getFullYear()} Nila Clinic. All rights reserved.</span>
          <div className="flex items-center space-x-3">
            <span className="text-slate-500">Clinical Data Privacy</span>
            <span>•</span>
            <span className="text-slate-500">Branch Portal</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT COLUMN: CLINIC WALL IMAGE ================= */}
      <div className="hidden lg:block lg:w-1/2 xl:w-7/12 relative h-full overflow-hidden bg-slate-950">
        <img
          src="/images/login-wall.jpg"
          alt="Nila Clinic - Skin & Hair Care Clinic"
          className="w-full h-full object-cover object-center select-none"
        />
      </div>
    </div>
  );
}
