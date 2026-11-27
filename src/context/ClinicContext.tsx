'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IStore, IUser } from '@/types';
import { getStoreAliases, canonicalStoreCode } from '@/lib/storeHelpers';

interface ClinicContextType {
  user: IUser | null;
  selectedStore: string; // Store code, e.g. 'THN', 'MDU', 'ALL'
  stores: IStore[];
  currentStoreObj: IStore | null;
  unreadDoctorVisits: number;
  isInitialized: boolean;
  storesLoaded: boolean;
  isLoggingOut: boolean;
  setSelectedStore: (code: string) => void;
  setUser: (user: IUser | null) => void;
  refreshStores: () => Promise<void>;
  refreshDoctorAlerts: () => Promise<void>;
  logout: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [selectedStore, setSelectedStoreState] = useState<string>('NILA-TH');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [storesLoaded, setStoresLoaded] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const [stores, setStores] = useState<IStore[]>([]);
  const [unreadDoctorVisits, setUnreadDoctorVisits] = useState<number>(0);
  const isAlertFetchingRef = React.useRef(false);

  const refreshStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStores(data.data);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setStoresLoaded(true);
    }
  };

  const refreshDoctorAlerts = async () => {
    if (!user || user.role !== 'doctor' || isAlertFetchingRef.current) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    isAlertFetchingRef.current = true;
    try {
      const res = await fetch(`/api/visits?storeCode=${selectedStore}&doctorId=${user._id || user.email}&status=Waiting`);
      const data = await res.json();
      if (data.success) {
        setUnreadDoctorVisits(data.unreadCount || 0);
      }
    } catch (err) {
    } finally {
      isAlertFetchingRef.current = false;
    }
  };

  useEffect(() => {
    refreshStores();

    // Client-side hydration of user and store from localStorage
    try {
      const saved = localStorage.getItem('nilaclinic_user') || localStorage.getItem('miosalon_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        const store = parsed.primaryStoreId || parsed.assignedStoreIds?.[0] || 'NILA-TH';
        setSelectedStoreState(canonicalStoreCode(store));
        setIsInitialized(true);
        return;
      }
    } catch (e) {}

    // No saved user found: remain unauthenticated
    setUser(null);
    setIsInitialized(true);
  }, []);

  // Poll notifications for doctor every 30 seconds cleanly with visibility detection (NFR-05)
  useEffect(() => {
    if (user?.role === 'doctor') {
      refreshDoctorAlerts();
      const interval = setInterval(refreshDoctorAlerts, 30000);
      const handleVis = () => {
        if (!document.hidden) refreshDoctorAlerts();
      };
      document.addEventListener('visibilitychange', handleVis);
      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVis);
      };
    }
  }, [user?._id, selectedStore]);

  const setSelectedStore = (code: string) => {
    // If not admin, restrict switching to assigned stores only (BR-04)
    if (user && user.role !== 'admin') {
      const allowed = (user.assignedStoreIds || []).flatMap(s => getStoreAliases(s).map(a => a.toUpperCase()));
      if (!allowed.includes(code.toUpperCase())) {
        alert(`Access Restricted: You are only authorized to access your assigned clinic store.`);
        return;
      }
    }
    setSelectedStoreState(code);
  };

  const logout = () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem('nilaclinic_user');
      localStorage.removeItem('miosalon_user');
      sessionStorage.clear();
    } catch (e) {}
    window.location.replace('/login');
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
        isInitialized,
        storesLoaded,
        isLoggingOut,
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
