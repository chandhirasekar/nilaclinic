'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Users,
  Sparkles,
  UserCheck,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  Stethoscope,
  ClipboardList,
  Store as StoreIcon,
  Briefcase,
} from 'lucide-react';
import { ClinicProvider, useClinic } from '@/context/ClinicContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, selectedStore, setSelectedStore, stores, unreadDoctorVisits, logout } = useClinic();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = user?.role || 'admin';

  // Navigation Items customized by Role (FR-02 & Section 9 matrix)
  const navItems = [
    // Dashboard: Admin (all stores / consolidated) and Staff (own store)
    ...(userRole !== 'doctor'
      ? [{ name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }]
      : []),

    // Doctor Panel: ONLY for Doctor (FR-14, FR-15) and Admin
    ...(userRole === 'doctor' || userRole === 'admin'
      ? [
          {
            name: 'Doctor Panel',
            href: '/admin/doctor',
            icon: Stethoscope,
            badge: unreadDoctorVisits > 0 ? unreadDoctorVisits : undefined,
          },
        ]
      : []),

    // Patient Entry & Queue: Admin & Staff
    ...(userRole === 'admin' || userRole === 'staff'
      ? [{ name: 'Patient Queue & Entry', href: '/admin/patients', icon: ClipboardList }]
      : []),

    // Appointments: Admin & Staff
    ...(userRole === 'admin' || userRole === 'staff'
      ? [{ name: 'Appointments', href: '/admin/appointments', icon: Calendar }]
      : []),

    // POS / Billing: Admin & Staff (BR-03: Doctor CANNOT see billing)
    ...(userRole === 'admin' || userRole === 'staff'
      ? [{ name: 'POS & Billing', href: '/admin/pos', icon: CreditCard }]
      : []),

    // Packages & Sittings: Admin & Staff (FR-29 to FR-39)
    ...(userRole === 'admin' || userRole === 'staff'
      ? [{ name: 'Packages & Sittings', href: '/admin/packages', icon: Package }]
      : []),

    // Branch Master: Admin ONLY (BUG-11, FR-01)
    ...(userRole === 'admin'
      ? [{ name: 'Branch Master', href: '/admin/stores', icon: StoreIcon }]
      : []),

    // Users & Store Assignment: Admin ONLY (FR-06, FR-07)
    ...(userRole === 'admin'
      ? [{ name: 'Users & Roles (Doctors)', href: '/admin/users', icon: UserCheck }]
      : []),

    // Staff Master: Admin ONLY (FR-08 to FR-10)
    ...(userRole === 'admin'
      ? [{ name: 'Staff Master', href: '/admin/staff', icon: Briefcase }]
      : []),

    // Customer CRM: Admin & Staff
    ...(userRole === 'admin' || userRole === 'staff'
      ? [{ name: 'Patients CRM', href: '/admin/customers', icon: Users }]
      : []),

    // Services Catalog: Admin
    ...(userRole === 'admin'
      ? [{ name: 'Service Catalog', href: '/admin/services', icon: Sparkles }]
      : []),

    // Reports: Admin & Staff
    ...(userRole === 'admin' || userRole === 'staff'
      ? [{ name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 }]
      : []),

    // Settings: Admin ONLY
    ...(userRole === 'admin'
      ? [{ name: 'Settings', href: '/admin/settings', icon: Settings }]
      : []),
  ];

  // Allowed stores for the user (Bug 6: Admin can see ALL stores consolidated)
  const selectableStores =
    userRole === 'admin'
      ? [
          { code: 'ALL', name: 'All Branches (Consolidated)' },
          ...stores,
        ]
      : stores.filter((s) => {
          const userStores = (user?.assignedStoreIds || []).map((id) => id.toUpperCase());
          return userStores.includes(s.code.toUpperCase()) || userStores.includes(s.code.replace('NILA-', '').toUpperCase());
        });

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar for Desktop & Mobile & Tablet */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:w-20 lg:w-64 bg-slate-900 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-all duration-300 ease-in-out flex flex-col h-screen max-h-screen justify-between overflow-hidden shadow-xl`}
      >
        {/* Logo Branding (Fixed Header) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 md:justify-center lg:justify-start w-full">
            <div className="bg-white p-1 rounded-lg shrink-0">
              <img src="/logo.png" alt="Nila Clinic Logo" className="h-8 w-auto object-contain" />
            </div>
            <div className="md:hidden lg:block truncate">
              <h1 className="font-bold text-white text-base leading-none tracking-tight">Nila Clinic</h1>
              <span className="text-xs text-emerald-400 font-semibold block mt-1">Clinic Workflow & POS</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain sidebar-scroll py-2">
          {/* Active Store Selector (FR-03, FR-05 & Bug 6 Multi-store) */}
          {/* Desktop & Mobile drawer: Full Selector */}
          <div className="p-3 mx-3 my-2 bg-slate-800/80 rounded-xl border border-slate-700/60 md:hidden lg:block">
            <div className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center justify-between">
              <span>Active Clinic Store</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              disabled={mounted && userRole !== 'admin' && selectableStores.length <= 1}
              suppressHydrationWarning
              className="w-full mt-2 bg-slate-900 border border-slate-700 text-sm font-medium text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {selectableStores.map((st) => (
                <option key={st.code} value={st.code}>
                  [{st.code}] {(st.name || '').replace('Nila Clinic - ', '')}
                </option>
              ))}
            </select>
            {mounted && userRole !== 'admin' && (
              <span className="text-xs text-slate-300 block mt-1.5 font-medium">Locked to assigned store ({selectedStore})</span>
            )}
            {mounted && userRole === 'admin' && selectedStore === 'ALL' && (
              <span className="text-xs text-emerald-400 block mt-1.5 font-semibold">Viewing Consolidated Network Data</span>
            )}
          </div>

          {/* Tablet Icon Rail: Compact Store Badge */}
          <div
            className="hidden md:flex lg:hidden flex-col items-center justify-center p-2 mx-2 my-2 bg-slate-800/80 rounded-xl border border-slate-700/60"
            title={`Active Clinic Store: [${selectedStore}]`}
          >
            <Building2 className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-full">
              {selectedStore.replace('NILA-', '')}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 sm:px-3 space-y-1.5 mt-2 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={item.name}
                  className={`relative flex items-center md:justify-center lg:justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center md:justify-center lg:justify-start space-x-0 lg:space-x-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    <span className="md:hidden lg:inline">{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <>
                      <span className="md:hidden lg:inline bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                      <span className="hidden md:block lg:hidden absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Footer (Clean & Secure - Fixes Bug 5 & Bug 9) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2 shrink-0">
          <div className="flex items-center justify-between md:flex-col lg:flex-row md:gap-2">
            <div className="flex items-center space-x-2.5 md:space-x-0 lg:space-x-2.5 overflow-hidden">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  userRole === 'admin'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : userRole === 'doctor'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}
                title={`${user?.name || 'Nila User'} (${userRole})`}
              >
                {userRole === 'admin' ? 'AD' : userRole === 'doctor' ? 'DR' : 'ST'}
              </div>
              <div className="truncate md:hidden lg:block">
                <p className="text-sm font-bold text-white truncate" suppressHydrationWarning>{user?.name || 'Nila User'}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    suppressHydrationWarning
                    className={`text-xs font-bold uppercase px-2 py-0.2 rounded ${
                      userRole === 'admin'
                        ? 'bg-purple-900/60 text-purple-300'
                        : userRole === 'doctor'
                        ? 'bg-sky-900/60 text-sky-300'
                        : 'bg-teal-900/60 text-teal-300'
                    }`}
                  >
                    {userRole}
                  </span>
                  <span className="text-xs text-slate-300 font-medium truncate" suppressHydrationWarning>
                    {user?.primaryStoreId ? `[${user.primaryStoreId}]` : ''}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-20 lg:ml-64 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-slate-900 text-base" suppressHydrationWarning>{user?.name || 'Nila Clinic'}</span>
                <span
                  suppressHydrationWarning
                  className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    userRole === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : userRole === 'doctor'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {userRole}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5" suppressHydrationWarning>
                Active Store: <span className="font-bold text-slate-800">[{selectedStore}]</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Quick Action Buttons according to role */}
            {userRole === 'doctor' && (
              <Link
                href="/admin/doctor"
                className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-xs transition"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Consultation Panel</span>
                {unreadDoctorVisits > 0 && (
                  <span className="bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded-full">
                    {unreadDoctorVisits}
                  </span>
                )}
              </Link>
            )}

            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Link
                  href="/admin/patients"
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Patient Entry & Queue</span>
                </Link>

                <Link
                  href="/admin/pos"
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>POS / Billing</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 w-full">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClinicProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ClinicProvider>
  );
}
