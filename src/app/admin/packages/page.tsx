'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Edit2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  History,
  X,
  Layers,
} from 'lucide-react';
import { IPackageMaster, ICustomerPackage, IService, ICustomer, IStaff } from '@/types';
import { useClinic } from '@/context/ClinicContext';
import PackageSchedulerModal from '@/components/admin/PackageSchedulerModal';
import { useInfiniteSlice } from '@/hooks/useInfiniteScroll';
import InfiniteScrollSentinel from '@/components/ui/InfiniteScrollSentinel';

export default function PackagesPage() {
  const { user, selectedStore, stores } = useClinic();
  const [activeTab, setActiveTab] = useState<'catalog' | 'customer_packages'>('catalog');

  // Masters
  const [packages, setPackages] = useState<IPackageMaster[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [staffMembers, setStaffMembers] = useState<IStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schedulingPackage, setSchedulingPackage] = useState<ICustomerPackage | null>(null);

  // Package Catalog Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [packageType, setPackageType] = useState<'Fixed' | 'On-demand'>('Fixed');
  const [selectedServices, setSelectedServices] = useState<{ serviceId: string; serviceName: string; count: number; valuePerSitting: number }[]>([]);
  const [packagePrice, setPackagePrice] = useState<number>(5000);
  const [validityDays, setValidityDays] = useState<number>(180);
  const [availableStores, setAvailableStores] = useState<string[]>(['ALL']);

  // Customer Packages Tab
  const [searchPackageQuery, setSearchPackageQuery] = useState('');
  const [packageTypeFilter, setPackageTypeFilter] = useState<'ALL' | 'Fixed' | 'On-demand'>('ALL');
  const [searchMobile, setSearchMobile] = useState('');
  const [searchedCustomer, setSearchedCustomer] = useState<ICustomer | null>(null);
  const [customerPackages, setCustomerPackages] = useState<ICustomerPackage[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);

  // Admin Adjustment Modal (FR-39)
  const [selectedPackageForAdjust, setSelectedPackageForAdjust] = useState<ICustomerPackage | null>(null);
  const [adjustSittingsDelta, setAdjustSittingsDelta] = useState<number>(0);
  const [adjustNewExpiry, setAdjustNewExpiry] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Doctor Privacy Protection (BR-03)
  if (user && user.role === 'doctor') {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl">
        <h3 className="font-bold text-sm">Doctor Access Restricted (Rule BR-03)</h3>
        <p className="text-xs mt-1">Package commercial management is restricted to Admin and Reception staff.</p>
      </div>
    );
  }

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pkgRes, svcRes, staffRes] = await Promise.all([
        fetch(`/api/packages?storeCode=${selectedStore}`),
        fetch(`/api/masters/services?storeCode=${selectedStore}`),
        fetch(`/api/masters/staff?storeCode=${selectedStore}`),
      ]);
      const pkgData = await pkgRes.json();
      const svcData = await svcRes.json();
      const staffData = await staffRes.json();
      if (pkgData.success) setPackages(pkgData.data || []);
      if (svcData.success) setServices(svcData.data || []);
      if (staffData.success) setStaffMembers(staffData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStore]);

  // Handle Customer Mobile Search
  const filteredPackages = packages.filter((pkg) => {
    const q = searchPackageQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      pkg.name.toLowerCase().includes(q) ||
      (pkg.services || []).some((s) => s.serviceName.toLowerCase().includes(q));
    const matchesType = packageTypeFilter === 'ALL' || pkg.type === packageTypeFilter;
    return matchesSearch && matchesType;
  });

  const {
    visibleItems: visiblePackages,
    hasMore: hasMorePackages,
    loadMore: loadMorePackages,
    visibleCount: visiblePkgCount,
    totalCount: totalPkgCount,
  } = useInfiniteSlice(filteredPackages, 10, `${selectedStore}|${searchPackageQuery}|${packageTypeFilter}`);

  const handleCustomerSearch = async () => {
    if (!searchMobile.trim()) return;
    setIsSearchingClient(true);
    try {
      const custRes = await fetch(`/api/customers?mobile=${encodeURIComponent(searchMobile.trim())}`);
      const custData = await custRes.json();
      if (custData.success && custData.data.length > 0) {
        const client = custData.data[0];
        setSearchedCustomer(client);
        const pkgRes = await fetch(`/api/packages/customer?customerId=${client.customerId || client._id}`);
        const pkgData = await pkgRes.json();
        if (pkgData.success) {
          setCustomerPackages(pkgData.data || []);
        }
      } else {
        alert('No client found matching this mobile number.');
        setSearchedCustomer(null);
        setCustomerPackages([]);
      }
    } catch (e) {
      alert('Error searching client packages');
    } finally {
      setIsSearchingClient(false);
    }
  };

  // Add Service row in Create Package modal
  const handleAddServiceToPackage = (serviceId: string) => {
    const svc = services.find(s => s._id === serviceId);
    if (!svc) return;
    if (selectedServices.some(s => s.serviceId === serviceId)) return;
    setSelectedServices([
      ...selectedServices,
      {
        serviceId: svc._id,
        serviceName: svc.name,
        count: 1,
        valuePerSitting: svc.price,
      },
    ]);
  };

  // Create Package submit
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim() || selectedServices.length === 0 || !packagePrice) {
      alert('Please provide package name, at least one service, and price.');
      return;
    }

    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: packageName.trim(),
          type: packageType,
          services: selectedServices,
          price: Number(packagePrice),
          validityDays: Number(validityDays),
          availableStores,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setPackageName('');
        setSelectedServices([]);
        loadData();
      } else {
        alert(data.message || 'Failed to create package');
      }
    } catch (err) {
      alert('Error creating package');
    }
  };

  // Submit Admin Adjustment (FR-39)
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageForAdjust) return;
    if (!adjustReason.trim()) {
      alert('A reason is mandatory for package adjustments.');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await fetch('/api/packages/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust',
          customerPackageId: selectedPackageForAdjust._id,
          deltaSittings: Number(adjustSittingsDelta),
          newExpiryDate: adjustNewExpiry || undefined,
          reason: adjustReason.trim(),
          byUser: user?.name || 'Administrator',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Package successfully adjusted.');
        setSelectedPackageForAdjust(null);
        setAdjustReason('');
        setAdjustSittingsDelta(0);
        // Refresh customer packages
        if (searchedCustomer) {
          const pRes = await fetch(`/api/packages/customer?customerId=${searchedCustomer.customerId || searchedCustomer._id}`);
          const pData = await pRes.json();
          if (pData.success) setCustomerPackages(pData.data);
        }
      } else {
        alert(data.message || 'Failed to adjust package');
      }
    } catch (e) {
      alert('Error adjusting package');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Packages & Sittings Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Module 4: Manage Fixed & On-demand packages, track client sittings balances, cross-store redemption, and validity.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-bold">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'catalog'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Package Catalog
            </button>
            <button
              onClick={() => setActiveTab('customer_packages')}
              className={`px-3.5 py-2 rounded-lg transition-all ${activeTab === 'customer_packages'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Client Sittings Balances
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Package</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PACKAGE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search Bar & Filter for Package Catalog */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search packages by name or included treatment..."
                value={searchPackageQuery}
                onChange={(e) => setSearchPackageQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {searchPackageQuery && (
                <button
                  type="button"
                  onClick={() => setSearchPackageQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Type:</span>
              {(['ALL', 'Fixed', 'On-demand'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPackageTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    packageTypeFilter === t
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'All Types' : `${t}`}
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-400 ml-2">
                ({filteredPackages.length} of {packages.length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visiblePackages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                        pkg.type === 'Fixed'
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {pkg.type} Package
                    </span>
                    <span className="text-xs font-semibold text-slate-600">Validity: {pkg.validityDays} days</span>
                  </div>

                  <h3 className="font-black text-slate-900 text-lg mb-1">{pkg.name}</h3>
                  <div className="text-3xl font-black text-slate-900 mb-3">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </div>

                  {/* Sittings & breakdown */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Total Sittings:</span>
                      <span className="font-bold text-slate-900">{pkg.totalSittings} Sessions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Value / Sitting:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{Math.round(pkg.valuePerSitting || pkg.price / pkg.totalSittings).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Store Availability:</span>
                      <span className="font-semibold text-slate-800">
                        {pkg.availableStores.includes('ALL') ? 'All Stores' : pkg.availableStores.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Services included list */}
                  <div>
                    <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
                      Included Treatments
                    </div>
                    <ul className="space-y-1.5">
                      {pkg.services.map((s, idx) => (
                        <li key={idx} className="flex items-center justify-between text-sm text-slate-800">
                          <span className="truncate pr-2 font-medium flex items-center">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1.5 flex-shrink-0" />
                            {s.serviceName}
                          </span>
                          <span className="bg-slate-200/70 text-slate-900 px-2.5 py-0.5 rounded-md font-bold text-xs">
                            {s.count} sittings
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium">
                  <span>Active in POS Quick Sale</span>
                  <span className="inline-flex items-center text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Ready to Sell
                  </span>
                </div>
              </div>
            ))}

            {filteredPackages.length === 0 && !isLoading && (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base text-slate-700 font-semibold">
                  {searchPackageQuery ? `No packages matching "${searchPackageQuery}"` : 'No packages configured yet'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {searchPackageQuery
                    ? 'Try clearing the search query or changing the type filter.'
                    : 'Click "Create Package" to configure your first treatment plan.'}
                </p>
              </div>
            )}
          </div>
          <InfiniteScrollSentinel
            hasMore={hasMorePackages}
            onLoadMore={loadMorePackages}
            visibleCount={visiblePkgCount}
            totalCount={totalPkgCount}
            itemLabel="packages"
          />
        </div>
      )}

      {/* TAB 2: CLIENT SITTINGS BALANCES */}
      {activeTab === 'customer_packages' && (
        <div className="space-y-5">
          {/* Client Search Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2">Look Up Client Package Balance</h3>
            <p className="text-sm text-slate-600 mb-4">
              Enter customer mobile number to inspect active packages, remaining sittings, expiry date, or perform admin adjustments.
            </p>
            <div className="flex gap-3 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Enter 10-digit mobile number..."
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomerSearch()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={handleCustomerSearch}
                disabled={isSearchingClient}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-xs"
              >
                {isSearchingClient ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchedCustomer && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-slate-900 text-base">{searchedCustomer.name}</span>
                  <span className="text-slate-600 ml-2 font-mono">({searchedCustomer.mobile})</span>
                  <span className="ml-3 px-2.5 py-0.5 bg-slate-100 rounded text-xs text-slate-700 font-bold">
                    ID: {searchedCustomer.customerId}
                  </span>
                </div>
                <div className="text-slate-600">
                  Registered at: <span className="font-bold text-slate-900">{searchedCustomer.firstStoreId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Packages List */}
          {searchedCustomer && (
            <div className="space-y-4">
              {customerPackages.map((cp) => (
                <div
                  key={cp._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-lg text-slate-900">{cp.packageName}</h4>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          {cp.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1 font-medium">
                        Purchased at store <span className="font-bold text-slate-800">{cp.storeSold}</span> • Bill #{' '}
                        <span className="font-mono font-bold text-slate-800">{cp.purchaseInvoiceNo}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="text-right mr-1">
                        <div className="text-xs text-slate-500 font-medium">Valid Until</div>
                        <div className="text-sm font-bold text-slate-900 font-mono">
                          {cp.validityExpiryDate}
                        </div>
                      </div>
                      {cp.remainingSittings > 0 && (
                        <button
                          type="button"
                          onClick={() => setSchedulingPackage(cp)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-xs transition flex items-center space-x-1.5"
                        >
                          <Calendar className="w-4 h-4" />
                          <span> Schedule Remaining ({cp.remainingSittings}) on Calendar</span>
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedPackageForAdjust(cp);
                            setAdjustNewExpiry(cp.validityExpiryDate);
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition"
                        >
                          Adjust Sittings
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sittings progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        Sittings: <strong className="text-indigo-700 font-black">{cp.remainingSittings} Remaining</strong> of {cp.totalSittings}
                      </span>
                      <span className="text-slate-600 font-medium">{cp.usedSittings} Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((cp.usedSittings / cp.totalSittings) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Services breakdown table */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="p-2.5">Service Name</th>
                          <th className="p-2.5 text-center">Total Allowed</th>
                          <th className="p-2.5 text-center">Used</th>
                          <th className="p-2.5 text-center">Remaining Balance</th>
                          <th className="p-2.5 text-right">Calendar Schedule</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cp.servicesRemaining.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-medium text-slate-800">{s.serviceName}</td>
                            <td className="p-2.5 text-center text-slate-600">{s.totalCount}</td>
                            <td className="p-2.5 text-center text-slate-600 font-semibold">{s.usedCount ?? Math.max(0, s.totalCount - s.remainingCount)}</td>
                            <td className="p-2.5 text-center font-bold text-indigo-600">
                              {s.remainingCount} sittings
                            </td>
                            <td className="p-2.5 text-right">
                              {s.remainingCount > 0 ? (
                                <Link
                                  href={`/admin/appointments?customerId=${encodeURIComponent(searchedCustomer?.customerId || searchedCustomer?._id || '')}&customerName=${encodeURIComponent(searchedCustomer?.name || '')}&customerPhone=${encodeURIComponent(searchedCustomer?.mobile || '')}&serviceName=${encodeURIComponent(s.serviceName)}&packageId=${encodeURIComponent(cp.packageId || '')}&packageName=${encodeURIComponent(cp.packageName || '')}&packageSitting=true`}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>Book in Calendar ({s.remainingCount} left)</span>
                                </Link>
                              ) : (
                                <span className="text-slate-400 text-[11px] font-medium">All completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Audit History (FR-39) */}
                  {cp.adjustmentHistory && cp.adjustmentHistory.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1 flex items-center">
                        <History className="w-3 h-3 mr-1" /> Adjustment Audit Log
                      </div>
                      <div className="space-y-1">
                        {cp.adjustmentHistory.map((hist, hIdx) => (
                          <div key={hIdx} className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                            <span className="font-semibold text-slate-700">{hist.action}</span> by{' '}
                            <span className="text-indigo-600">{hist.byUser}</span> on{' '}
                            {new Date(hist.date).toLocaleDateString()} — Reason:{' '}
                            <em>&quot;{hist.reason}&quot;</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {customerPackages.length === 0 && (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
                  This client does not have any active packages purchased.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE PACKAGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Create Treatment Package</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skin Brightening Laser Pack (6 Sittings)"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Type</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Fixed">Fixed (Predefined treatments)</option>
                    <option value="On-demand">On-demand (Configured at sale)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Add Services to Package *</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddServiceToPackage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white mb-2"
                >
                  <option value="">-- Choose service to add --</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                </select>

                {selectedServices.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl mb-1.5 border border-slate-200">
                    <span className="font-medium text-slate-800">{s.serviceName}</span>
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] text-slate-500">Sittings:</label>
                      <input
                        type="number"
                        min="1"
                        value={s.count}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...selectedServices];
                          updated[idx].count = val;
                          setSelectedServices(updated);
                        }}
                        className="w-14 p-1 border border-slate-300 rounded text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedServices(selectedServices.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Sittings</label>
                  <div className="p-2.5 bg-slate-100 rounded-xl font-bold text-slate-700">
                    {selectedServices.reduce((acc, s) => acc + (s.count || 0), 0)} Sittings
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Availability</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availableStores.includes('ALL')}
                      onChange={(e) => {
                        if (e.target.checked) setAvailableStores(['ALL']);
                        else setAvailableStores([]);
                      }}
                    />
                    <span>All Stores</span>
                  </label>
                  {stores.map((st) => (
                    <label key={st.code} className="flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availableStores.includes(st.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailableStores(availableStores.filter(s => s !== 'ALL').concat(st.code));
                          } else {
                            setAvailableStores(availableStores.filter(s => s !== st.code));
                          }
                        }}
                      />
                      <span>{st.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN ADJUSTMENT MODAL (FR-39) */}
      {selectedPackageForAdjust && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Adjust Package Sittings & Validity</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedPackageForAdjust.packageName}</p>
              </div>
              <button onClick={() => setSelectedPackageForAdjust(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-[11px] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Admin Audit Rule: Every manual change to sittings count or validity extension is strictly recorded in the client’s audit history.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Add / Deduct Sittings</label>
                  <input
                    type="number"
                    value={adjustSittingsDelta}
                    onChange={(e) => setAdjustSittingsDelta(Number(e.target.value))}
                    placeholder="+1 or -1"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Use negative numbers to deduct</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={adjustNewExpiry}
                    onChange={(e) => setAdjustNewExpiry(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Reason *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Complimentary sitting granted due to rescheduling delay..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPackageForAdjust(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition"
                >
                  {isAdjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Multi-Session Calendar Scheduler Modal */}
      {schedulingPackage && searchedCustomer && (
        <PackageSchedulerModal
          isOpen={Boolean(schedulingPackage)}
          onClose={() => setSchedulingPackage(null)}
          customer={{
            customerId: searchedCustomer.customerId || (searchedCustomer as any)._id,
            name: searchedCustomer.name,
            mobile: searchedCustomer.mobile,
          }}
          customerPackage={schedulingPackage}
          staffMembers={staffMembers}
          storeId={selectedStore}
          onSuccess={() => {
            handleCustomerSearch();
          }}
        />
      )}
    </div>
  );
}

