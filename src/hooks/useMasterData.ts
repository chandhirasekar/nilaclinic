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
    services: services || [],
    products: products || [],
    packages: packages || [],
    staff: staff || [],
    paymentModes: paymentModes || [],
    settings: settings || null,
    invoices: invoices || [],
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

