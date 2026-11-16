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
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { ClinicProvider, useClinic } from '@/context/ClinicContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, selectedStore, setSelectedStore, stores, unreadDoctorVisits, logout, setUser } = useClinic();

  const userRole = user?.role || 'admin';

  // Navigation Items customized by Role (FR-02 & Section 9 matrix)
  const navItems = [
    // Dashboard: Admin (all stores), Staff (own store), Doctor (hidden)
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

    // Store Master: Admin ONLY (FR-01)
    ...(userRole === 'admin'
      ? [{ name: 'Store Master', href: '/admin/stores', icon: StoreIcon }]
      : []),

    // Users & Store Assignment: Admin ONLY (FR-06, FR-07)
    ...(userRole === 'admin'
      ? [{ name: 'Users & Roles', href: '/admin/users', icon: UserCheck }]
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

    // Settings
    ...(userRole === 'admin'
      ? [{ name: 'Settings', href: '/admin/settings', icon: Settings }]
      : []),
  ];

  // Allowed stores for the user
  const selectableStores =
    userRole === 'admin'
      ? stores
      : stores.filter((s) => user?.assignedStoreIds?.map((id) => id.toUpperCase()).includes(s.code.toUpperCase()));

  // Role fast-switch simulator for testing / demo verification
  const switchDemoRole = (role: 'admin' | 'staff' | 'doctor') => {
    if (role === 'admin') {
      const u = {
        _id: 'user-admin-1',
        email: 'admin@nilaclinic.com',
        name: 'Mohan Raj (Admin)',
        role: 'admin' as const,
        assignedStoreIds: ['THN', 'MDU', 'CHN'],
        primaryStoreId: 'THN',
        isActive: true,
      };
      setUser(u);
      localStorage.setItem('nilaclinic_user', JSON.stringify(u));
    } else if (role === 'doctor') {
      const u = {
        _id: 'user-doc-1',
        email: 'doctor.theni@nilaclinic.com',
        name: 'Dr. Anitha Ramachandran',
        role: 'doctor' as const,
        phone: '+91 98450 22334',
        assignedStoreIds: ['THN'],
        primaryStoreId: 'THN',
        specialization: 'Senior Dermatologist',
        isActive: true,
      };
      setUser(u);
      setSelectedStore('THN');
      localStorage.setItem('nilaclinic_user', JSON.stringify(u));
    } else {
      const u = {
        _id: 'user-staff-1',
        email: 'staff.theni@nilaclinic.com',
        name: 'Pooja Sharma (Staff)',
        role: 'staff' as const,
        phone: '+91 98450 55667',
        assignedStoreIds: ['THN'],
        primaryStoreId: 'THN',
        isActive: true,
      };
      setUser(u);
      setSelectedStore('THN');
      localStorage.setItem('nilaclinic_user', JSON.stringify(u));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Sidebar for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between`}
      >
        <div>
          {/* Logo Branding */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded-lg">
                <img src="/logo.png" alt="Nila Clinic Logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base leading-none tracking-tight">Nila Clinic</h1>
                <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">Clinic Workflow & POS</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Store Selector (FR-03, FR-05) */}
          <div className="p-3 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
              <span>Active Clinic Store</span>
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              disabled={userRole !== 'admin' && selectableStores.length <= 1}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {selectableStores.map((st) => (
                <option key={st.code} value={st.code}>
                  [{st.code}] {st.name.replace('Nila Clinic - ', '')}
                </option>
              ))}
            </select>
            {userRole !== 'admin' && (
              <span className="text-[10px] text-slate-400 block mt-1">Locked to assigned store ({selectedStore})</span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Demo Fast Role Switcher & User Account Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
          {/* Quick Role Tester Pill */}
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-[10px]">
            <span className="text-slate-400 uppercase font-bold block mb-1">Simulate Role Login:</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => switchDemoRole('admin')}
                className={`py-1 rounded font-bold transition-colors ${
                  userRole === 'admin' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchDemoRole('doctor')}
                className={`py-1 rounded font-bold transition-colors ${
                  userRole === 'doctor' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Doctor
              </button>
              <button
                onClick={() => switchDemoRole('staff')}
                className={`py-1 rounded font-bold transition-colors ${
                  userRole === 'staff' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Staff
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  userRole === 'admin'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : userRole === 'doctor'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}
              >
                {userRole === 'admin' ? 'AD' : userRole === 'doctor' ? 'DR' : 'ST'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Nila User'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Role: {userRole}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">{user?.name || 'Nila Clinic'}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
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
              <p className="text-[11px] text-slate-500">Store: <span className="font-semibold text-slate-700">[{selectedStore}]</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Quick Action Buttons according to role */}
            {userRole === 'doctor' && (
              <Link
                href="/admin/doctor"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Consultation Panel</span>
                {unreadDoctorVisits > 0 && (
                  <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                    {unreadDoctorVisits}
                  </span>
                )}
              </Link>
            )}

            {(userRole === 'admin' || userRole === 'staff') && (
              <>
                <Link
                  href="/admin/patients"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Patient Entry & Queue</span>
                </Link>

                <Link
                  href="/admin/pos"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>POS / Billing</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
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
