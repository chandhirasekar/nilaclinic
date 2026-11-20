'use client';

import useSWR from 'swr';
import { IService, IProduct, IPackageMaster, IStaff, IPaymentMode, IClinicSettings, IInvoice } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const json = await res.json();
  return json.data;
};

// SWR Cache configuration: Stale-While-Revalidate with 2-minute deduplication
const swrConfig = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 120000, // 2 minutes in-memory cache
  keepPreviousData: true,
};

// Stable references to prevent unnecessary re-renders when data is empty/loading
const EMPTY_SERVICES: IService[] = [];
const EMPTY_PRODUCTS: IProduct[] = [];
const EMPTY_PACKAGES: IPackageMaster[] = [];
const EMPTY_STAFF: IStaff[] = [];
const EMPTY_PAYMENT_MODES: IPaymentMode[] = [];
const EMPTY_INVOICES: IInvoice[] = [];

export function useMasterData(storeCode?: string) {
  const storeParam = storeCode ? `?storeCode=${storeCode}` : '';

  const { data: services, isLoading: loadingServices, mutate: mutateServices } = useSWR<IService[]>(
    `/api/masters/services${storeParam}`,
    fetcher,
    swrConfig
  );

  const { data: products, isLoading: loadingProducts, mutate: mutateProducts } = useSWR<IProduct[]>(
    `/api/masters/products${storeParam}`,
    fetcher,
    swrConfig
  );

  const { data: packages, isLoading: loadingPackages, mutate: mutatePackages } = useSWR<IPackageMaster[]>(
    `/api/packages${storeParam}`,
    fetcher,
    swrConfig
  );

  const { data: staff, isLoading: loadingStaff, mutate: mutateStaff } = useSWR<IStaff[]>(
    `/api/masters/staff${storeParam}`,
    fetcher,
    swrConfig
  );

  const { data: paymentModes, isLoading: loadingPaymentModes } = useSWR<IPaymentMode[]>(
    '/api/masters/payment-modes',
    fetcher,
    swrConfig
  );

  const { data: settings, isLoading: loadingSettings } = useSWR<IClinicSettings>(
    '/api/masters/settings',
    fetcher,
    swrConfig
  );

  const { data: invoices, isLoading: loadingInvoices, mutate: mutateInvoices } = useSWR<IInvoice[]>(
    `/api/invoices${storeParam}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 15000, // Invoices refresh faster
      keepPreviousData: true,
    }
  );

  const isLoading =
    loadingServices ||
    loadingProducts ||
    loadingPackages ||
    loadingStaff ||
    loadingPaymentModes ||
    loadingSettings;

  return {
    services: services || EMPTY_SERVICES,
    products: products || EMPTY_PRODUCTS,
    packages: packages || EMPTY_PACKAGES,
    staff: staff || EMPTY_STAFF,
    paymentModes: paymentModes || EMPTY_PAYMENT_MODES,
    settings: settings || null,
    invoices: invoices || EMPTY_INVOICES,
    isLoading,
    refreshInvoices: mutateInvoices,
    refreshAll: () => {
      mutateServices();
      mutateProducts();
      mutatePackages();
      mutateStaff();
      mutateInvoices();
    },
  };
}

export default useMasterData;

