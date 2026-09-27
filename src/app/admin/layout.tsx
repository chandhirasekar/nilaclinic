'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Users,
  Scissors,
  UserCheck,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  Plus
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ email: 'theni@bonitaa.co.in', name: 'Nila Clinic Admin', salonName: 'Nila Clinic - Skin & Hair Care' });
  const [selectedBranch, setSelectedBranch] = useState('Nila Clinic - Main Branch');

  useEffect(() => {
    const saved = localStorage.getItem('miosalon_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'POS / Billing', href: '/admin/pos', icon: CreditCard },
    { name: 'Customers CRM', href: '/admin/customers', icon: Users },
    { name: 'Service Catalog', href: '/admin/services', icon: Scissors },
    { name: 'Staff & Roster', href: '/admin/staff', icon: UserCheck },
    { name: 'Inventory & Stock', href: '/admin/inventory', icon: Package },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between`}>
        <div>
          {/* Logo Branding with Nila Clinic Logo */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded-lg">
                <img src="/logo.png" alt="Nila Clinic Logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base leading-none tracking-tight">Nila Clinic</h1>
                <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">Skin & Hair Care</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Location Selector */}
          <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
              <span>Active Location</span>
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full mt-1.5 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Nila Clinic - Main Branch">Nila Clinic - Main Branch</option>
              <option value="Nila Clinic - City Center">Nila Clinic - City Outlet</option>
              <option value="Nila Clinic - Specialty Center">Nila Clinic - Laser & Hair Hub</option>
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                NC
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name || 'Nila Clinic Admin'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <Link href="/login" className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800" title="Logout">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center space-x-3">
              <img src="/logo.png" alt="Nila Clinic" className="h-6 w-auto" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Welcome, {user.name || 'Nila Clinic Admin'}</h2>
                <p className="text-xs text-slate-500">Managing {selectedBranch}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/pos"
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 via-emerald-600 to-teal-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>New POS Checkout</span>
            </Link>
            
            <Link
              href="/admin/appointments"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>

            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
