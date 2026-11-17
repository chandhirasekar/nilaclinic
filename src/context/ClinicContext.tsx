'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IStore, IUser } from '@/types';

interface ClinicContextType {
  user: IUser | null;
  selectedStore: string; // Store code, e.g. 'THN', 'MDU', 'ALL'
  stores: IStore[];
  currentStoreObj: IStore | null;
  unreadDoctorVisits: number;
  setSelectedStore: (code: string) => void;
  setUser: (user: IUser | null) => void;
  refreshStores: () => Promise<void>;
  refreshDoctorAlerts: () => Promise<void>;
  logout: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [selectedStore, setSelectedStoreState] = useState<string>('THN');
  const [stores, setStores] = useState<IStore[]>([]);
  const [unreadDoctorVisits, setUnreadDoctorVisits] = useState<number>(0);

  const refreshStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStores(data.data);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    }
  };

  const refreshDoctorAlerts = async () => {
    if (!user || user.role !== 'doctor') return;
    try {
      const res = await fetch(`/api/visits?storeCode=${selectedStore}&doctorId=${user._id || user.email}&status=Waiting`);
      const data = await res.json();
      if (data.success) {
        setUnreadDoctorVisits(data.unreadCount || 0);
      }
    } catch (err) {}
  };

  useEffect(() => {
    refreshStores();

    // Load user from storage
    const saved = localStorage.getItem('nilaclinic_user') || localStorage.getItem('miosalon_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        const store = parsed.primaryStoreId || parsed.assignedStoreIds?.[0] || 'THN';
        setSelectedStoreState(store);
      } catch (e) {}
    } else {
      // Default initial mock admin user for immediate seamless access
      const defaultUser: IUser = {
        _id: 'user-admin-1',
        email: 'admin@nilaclinic.com',
        name: 'Mohan Raj (Admin)',
        role: 'admin',
        assignedStoreIds: ['THN', 'MDU', 'CHN'],
        primaryStoreId: 'THN',
        isActive: true,
      };
      setUser(defaultUser);
      localStorage.setItem('nilaclinic_user', JSON.stringify(defaultUser));
    }
  }, []);

  // Poll notifications for doctor every 6 seconds (NFR-05: auto-refresh every few seconds)
  useEffect(() => {
    if (user?.role === 'doctor') {
      refreshDoctorAlerts();
      const interval = setInterval(refreshDoctorAlerts, 6000);
      return () => clearInterval(interval);
    }
  }, [user, selectedStore]);

  const setSelectedStore = (code: string) => {
    // If not admin, restrict switching to assigned stores only (BR-04)
    if (user && user.role !== 'admin') {
      if (!user.assignedStoreIds.map(s => s.toUpperCase()).includes(code.toUpperCase())) {
        alert(`Access Restricted: You are only authorized to access your assigned clinic store.`);
        return;
      }
    }
    setSelectedStoreState(code);
  };

  const logout = () => {
    localStorage.removeItem('nilaclinic_user');
    localStorage.removeItem('miosalon_user');
    setUser(null);
    window.location.href = '/login';
  };

  const currentStoreObj: IStore | null =
    selectedStore === 'ALL'
      ? ({
          _id: 'store-all',
          name: 'All Clinic Branches (Consolidated)',
          code: 'ALL',
          address: 'Multi-Store Consolidated View',
          phone: '+91 98450 11223',
          email: 'admin@nilaclinic.com',
          gstin: '33ABCDE1234F1Z5',
          workingHours: { open: '09:00 AM', close: '08:00 PM', weeklyOff: 'None' },
          invoicePrefix: 'NILA-',
          nextInvoiceNumber: 1001,
          isActive: true,
        } as IStore)
      : stores.find((s) => s.code.toUpperCase() === selectedStore.toUpperCase()) || stores[0] || null;

  return (
    <ClinicContext.Provider
      value={{
        user,
        selectedStore,
        stores,
        currentStoreObj,
        unreadDoctorVisits,
        setSelectedStore,
        setUser,
        refreshStores,
        refreshDoctorAlerts,
        logout,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
