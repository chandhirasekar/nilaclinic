'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Printer,
  Search,
  X,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Package,
  Receipt,
  UserCheck,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  ICustomer,
  IService,
  IProduct,
  IStaff,
  IPaymentMode,
  IClinicSettings,
  IInvoice,
  IQuickSaleItem,
  IPaymentSplit,
  IPackageMaster,
  ICustomerPackage,
} from '@/types';
import { useClinic } from '@/context/ClinicContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useMasterData } from '@/hooks/useMasterData';
import { ButtonLoader } from '@/components/ui/ButtonLoader';
import { PosGridSkeleton } from '@/components/ui/skeletons/PosGridSkeleton';
import PackageSchedulerModal from '@/components/admin/PackageSchedulerModal';

function QuickSalePOSContent() {
  const { user, selectedStore, stores, currentStoreObj } = useClinic();
  const searchParams = useSearchParams();
  const invoiceNoFromUrl = searchParams.get('invoiceNo');
  const [activeInvoiceNo, setActiveInvoiceNo] = useState<string | null>(null);

  // Masters from optimized client-side SWR Cache
  const {
    services,
    products,
    packages,
    staff: staffList,
    paymentModes,
    settings,
    invoices: recentBills,
    isLoading: isMasterLoading,
    refreshInvoices,
  } = useMasterData(selectedStore);

  // Active Customer Lookup (FR-20, FR-21, FR-22)
  const [searchMobile, setSearchMobile] = useState('');
  const [matchingCustomers, setMatchingCustomers] = useState<ICustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [customerPackages, setCustomerPackages] = useState<ICustomerPackage[]>([]);
  const [showInlineAddClient, setShowInlineAddClient] = useState(false);
  const [inlineClientName, setInlineClientName] = useState('');
  const [inlineClientGender, setInlineClientGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [inlineClientEmail, setInlineClientEmail] = useState('');
  const [inlineClientArea, setInlineClientArea] = useState('');

  // Bill Information (FR-40)
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<IQuickSaleItem[]>([]);
  const [remarks, setRemarks] = useState('');

  // Modals for adding items
  const [showCatalogModal, setShowCatalogModal] = useState<'service' | 'product' | 'package' | null>(null);
  const [showRedeemPackageModal, setShowRedeemPackageModal] = useState(false);

  // Discounts (FR-45: value OR percent, one at a time)
  const [discountType, setDiscountType] = useState<'percent' | 'value'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Tip (FR-48)
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipStaffName, setTipStaffName] = useState<string>('');

  // Split Payments (FR-46)
  const [payments, setPayments] = useState<Record<string, number>>({});
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Print & Receipt Modal
  const [lastInvoice, setLastInvoice] = useState<IInvoice | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bill List Drawer (FR-53)
  const [showBillList, setShowBillList] = useState(false);
  const [recentBillFilter, setRecentBillFilter] = useState<'ALL' | 'services' | 'products' | 'packages'>('ALL');
  const [schedulingPackage, setSchedulingPackage] = useState<ICustomerPackage | null>(null);

  // BUG-08: Recent Activity (Consultation Done Patients)
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Load recent consultations awaiting billing
  useEffect(() => {
    if (selectedStore) {
      fetch(`/api/visits?storeCode=${selectedStore}&status=Done`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setRecentConsultations(data.data.filter((v: any) => !v.billId));
          }
        })
        .catch(() => {});
    }
  }, [selectedStore]);

  // BR-03: Doctor restricted from seeing billing amounts or bills
  if (user && user.role === 'doctor') {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl">
        <h3 className="font-bold text-sm">Doctor Access Restricted (Rule BR-03)</h3>
        <p className="text-xs mt-1">
          By clinical privacy rules, doctors cannot view clinic billing tickets, invoice amounts, or collections.
        </p>
      </div>
    );
  }

  // If navigated with ?invoiceNo=..., pre-populate the unpaid consultation bill
  useEffect(() => {
    if (invoiceNoFromUrl) {
      fetch(`/api/invoices?invoiceNo=${encodeURIComponent(invoiceNoFromUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const inv = data.data;
            if (inv.status === 'Paid') {
              alert(`Bill #${inv.invoiceNo} has already been settled as Paid.`);
              if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', '/admin/pos');
              }
              return;
            }
            setActiveInvoiceNo(inv.invoiceNo);
            if (inv.items && inv.items.length > 0) {
              setItems(inv.items);
            }
            if (inv.customerName || inv.customerMobile) {
              setSelectedCustomer({
                customerId: inv.customerId,
                name: inv.customerName,
                mobile: inv.customerMobile || inv.customerPhone,
                gender: 'Female',
              } as any);
              setSearchMobile(inv.customerMobile || inv.customerPhone || '');
            }
            if (inv.remarks) setRemarks(inv.remarks);
            const billTotal = inv.payableAmount || inv.grandTotal || 0;
            if (billTotal > 0) {
              setPayments({ Cash: billTotal });
              setCashTendered(billTotal);
            }
          }
        })
        .catch(() => { });
    }
  }, [invoiceNoFromUrl]);

  // Load customer packages when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      fetch(`/api/packages/customer?customerId=${selectedCustomer.customerId || selectedCustomer._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCustomerPackages(data.data || []);
          } else {
            setCustomerPackages([]);
          }
        })
        .catch(() => setCustomerPackages([]));
    } else {
      setCustomerPackages([]);
    }
  }, [selectedCustomer]);

  // 300ms Debounced mobile lookup (avoids firing API queries on every keystroke)
  const debouncedSearchMobile = useDebounce(searchMobile, 300);

  useEffect(() => {
    const mob = debouncedSearchMobile.trim();
    if (mob.length >= 4) {
      fetch(`/api/customers?mobile=${encodeURIComponent(mob)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMatchingCustomers(data.data || []);
            if (data.data.length === 1 && !selectedCustomer) {
              setSelectedCustomer(data.data[0]);
            }
          }
        })
        .catch(() => { });
    } else {
      setMatchingCustomers([]);
    }
  }, [debouncedSearchMobile]);

  const handleMobileLookup = (mob: string) => {
    setSearchMobile(mob);
    setSelectedCustomer(null);
    setShowInlineAddClient(false);
  };

  // Inline Add Client (FR-22)
  const handleInlineAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineClientName.trim() || !searchMobile.trim()) {
      alert('Client Name and Mobile Number are required.');
      return;
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inlineClientName.trim(),
          mobile: searchMobile.trim(),
          gender: inlineClientGender,
          email: inlineClientEmail,
          area: inlineClientArea,
          firstStoreId: selectedStore,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCustomer(data.data);
        setShowInlineAddClient(false);
        setMatchingCustomers([data.data]);
      } else {
        alert(data.message || 'Error creating client');
      }
    } catch (err) {
      alert('Failed to register client inline');
    }
  };

  // Add Item to Bill (FR-42, FR-43)
  const addItemToBill = (item: IService | IProduct, type: 'service' | 'product') => {
    const defaultStaff = staffList[0]?.name || 'Attending Specialist';
    const defaultStaffId = staffList[0]?._id;

    const newItem: IQuickSaleItem = {
      type,
      itemId: item._id,
      name: item.name,
      staffId: defaultStaffId,
      staffName: defaultStaff,
      quantity: 1,
      price: item.price,
      discountPercent: 0,
      total: item.price,
    };

    setItems((prev) => [...prev, newItem]);
    setShowCatalogModal(null);
  };

  // Sell Package in Quick Sale (FR-35)
  const addPackageToBill = (pkg: IPackageMaster) => {
    const defaultStaff = staffList[0]?.name || 'Attending Specialist';
    const defaultStaffId = staffList[0]?._id;

    const newItem: IQuickSaleItem = {
      type: 'package',
      itemId: pkg._id,
      name: pkg.name,
      staffId: defaultStaffId,
      staffName: defaultStaff,
      quantity: 1,
      price: pkg.price,
      discountPercent: 0,
      total: pkg.price,
    };

    setItems((prev) => [...prev, newItem]);
    setShowCatalogModal(null);
  };

  // Redeem Customer Package Sitting (FR-36: sitting added at ₹0 marked from package)
  const redeemSittingToBill = (custPkg: ICustomerPackage, serviceName: string) => {
    const defaultStaff = staffList[0]?.name || 'Attending Specialist';
    const defaultStaffId = staffList[0]?._id;

    const newItem: IQuickSaleItem = {
      type: 'package_use',
      itemId: custPkg.packageId,
      packageId: custPkg._id,
      name: `${serviceName} (From Package: ${custPkg.packageName})`,
      packageServiceName: serviceName,
      staffId: defaultStaffId,
      staffName: defaultStaff,
      quantity: 1,
      price: 0,
      discountPercent: 0,
      total: 0,
      isFromPackage: true,
    };

    setItems((prev) => [...prev, newItem]);
    setShowRedeemPackageModal(false);
  };

  const updateItemField = (index: number, field: keyof IQuickSaleItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    // Recalculate row total (BUG-16: Zero qty gives ₹0; BUG-17: clamp discount & prices)
    const rawQty = Number(updated[index].quantity);
    const qty = isNaN(rawQty) || rawQty < 0 ? 0 : rawQty;
    const price = Math.max(0, Number(updated[index].price) || 0);
    const rawDisc = Number(updated[index].discountPercent) || 0;
    const maxAllowedDisc = user?.role === 'admin' ? 100 : (settings?.maxStaffDiscountPercent || 10);
    const discPct = Math.min(maxAllowedDisc, Math.max(0, rawDisc));

    updated[index].quantity = qty;
    updated[index].price = price;
    updated[index].discountPercent = discPct;
    const lineTotal = Math.max(0, Math.round(qty * price * (1 - discPct / 100)));
    updated[index].total = lineTotal;

    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // calculations (Section 10 Calculation Rules)
  const subtotal = Math.max(0, items.reduce((sum, it) => sum + (it.total || 0), 0));

  // Bill discount (BUG-17: clamp discount within staff limits and reject negatives)
  let billDiscountAmount = 0;
  const maxStaffDisc = user?.role === 'admin' ? 100 : (settings?.maxStaffDiscountPercent || 10);
  const safeDiscountVal = Math.max(0, Number(discountValue) || 0);
  if (discountType === 'percent') {
    const clampedPct = Math.min(maxStaffDisc, safeDiscountVal);
    billDiscountAmount = Math.round((subtotal * clampedPct) / 100);
  } else {
    billDiscountAmount = Math.min(subtotal, safeDiscountVal);
  }
  if (billDiscountAmount > subtotal) billDiscountAmount = subtotal;

  // GST (if enabled in settings)
  const isGstOn = Boolean(settings?.gstOnBills);
  const gstAmount = isGstOn ? Math.round((subtotal - billDiscountAmount) * 0.18) : 0;

  const grandTotal = subtotal - billDiscountAmount + gstAmount;
  const payableAmount = grandTotal + (Number(tipAmount) || 0);

  // Payment splits calculation
  const cashRaw = Number(payments['Cash']) || 0;
  const nonCashTotal = Object.entries(payments)
    .filter(([m]) => m !== 'Cash')
    .reduce((acc, [_, v]) => acc + (Number(v) || 0), 0);

  // Cash needed to settle the remaining bill after non-cash payments (Card, UPI, NEFT)
  const cashNeeded = Math.max(0, payableAmount - nonCashTotal);

  // If the patient pays with a larger currency note (e.g. ₹2000 note for ₹1800 bill):
  // The amount applied to settle the bill is capped at cashNeeded.
  const isCashOverpaid = cashRaw > cashNeeded && cashNeeded > 0;
  const effectiveCashApplied = isCashOverpaid ? cashNeeded : cashRaw;

  // Total paid towards the bill and balance remaining
  const totalPaidAcrossModes = nonCashTotal + effectiveCashApplied;
  const balanceRemaining = payableAmount - totalPaidAcrossModes;

  // Auto-sync single payment mode when payableAmount changes (e.g. adding discount or line items)
  useEffect(() => {
    if (payableAmount <= 0) return;
    setPayments((prev) => {
      const activeEntries = Object.entries(prev).filter(([_, amt]) => Number(amt) > 0);
      if (activeEntries.length <= 1) {
        const activeMode = activeEntries[0]?.[0] || 'Cash';
        return {
          ...prev,
          [activeMode]: payableAmount,
        };
      }
      return prev;
    });
  }, [payableAmount]);

  // Cash Tendered (the actual currency note / cash handed over by the patient):
  // If the user entered 2000 in Cash or in Cash Tendered, effectiveCashTendered is 2000.
  // If cash is e.g. 200 in split payment, defaults to 200 (so change is 0 unless a higher note is entered).
  const effectiveCashTendered = cashTendered > 0
    ? Math.max(cashTendered, cashRaw)
    : Math.max(cashRaw, effectiveCashApplied);

  // Change amount calculation (only cash gives change: Section 10)
  // Example: Bill ₹1,800, patient gives ₹2,000 note -> Change = ₹200.
  const changeAmount = (effectiveCashTendered > effectiveCashApplied && effectiveCashApplied > 0)
    ? effectiveCashTendered - effectiveCashApplied
    : 0;

  // Set single payment mode helper
  const setExactPaymentMode = (modeName: string) => {
    const newPayments: Record<string, number> = {};
    paymentModes.forEach((pm) => {
      newPayments[pm.name] = pm.name === modeName ? payableAmount : 0;
    });
    setPayments(newPayments);
    if (modeName === 'Cash') {
      setCashTendered(payableAmount);
    } else {
      setCashTendered(0);
    }
  };

  // 1-Click Auto-Balance helper for split payments
  const handleAutoBalance = () => {
    const activeEntries = Object.entries(payments).filter(([_, amt]) => Number(amt) > 0);
    const primaryMode = activeEntries[0]?.[0] || 'Cash';
    setPayments((prev) => ({
      ...prev,
      [primaryMode]: Math.max(0, (Number(prev[primaryMode]) || 0) + balanceRemaining),
    }));
  };

  // Save Bill (FR-50, FR-51)
  const handleSaveBill = async () => {
    if (items.length === 0) {
      alert('Billing ticket is empty. Please add services or products.');
      return;
    }

    // BUG-16: Enforce minimum quantity 1
    if (items.some((it) => (Number(it.quantity) || 0) <= 0)) {
      alert('All line items must have a minimum quantity of 1.');
      return;
    }

    // BUG-17: Block negative totals
    if (subtotal < 0 || payableAmount < 0) {
      alert('Payable amount cannot be negative.');
      return;
    }

    let finalPayments = { ...payments };
    const nonZeroModes = Object.entries(finalPayments).filter(([_, amt]) => Number(amt) > 0);

    // If only one payment mode is used (or none), auto-balance to payableAmount to eliminate discrepancy
    if (nonZeroModes.length <= 1) {
      const mode = nonZeroModes[0]?.[0] || 'Cash';
      const enteredAmt = Number(nonZeroModes[0]?.[1] || 0);
      if (mode === 'Cash' && enteredAmt > payableAmount) {
        setCashTendered(enteredAmt);
      }
      finalPayments = {
        [mode]: payableAmount,
      };
      setPayments(finalPayments);
    } else {
      // Split payments: if cash was overpaid, cap cash applied to remaining balance needed
      if (isCashOverpaid && nonCashTotal < payableAmount) {
        finalPayments['Cash'] = cashNeeded;
      }
      const splitTotal = Object.values(finalPayments).reduce((sum, v) => sum + (Number(v) || 0), 0);
      if (Math.abs(splitTotal - payableAmount) > 0.5) {
        alert(`Split payments total (₹${splitTotal.toFixed(2)}) must equal payable amount (₹${payableAmount.toFixed(2)}). Balance remaining: ₹${(payableAmount - splitTotal).toFixed(2)}. Click Auto-Balance to adjust.`);
        return;
      }
    }

    setIsProcessing(true);

    const paymentSplits: IPaymentSplit[] = Object.entries(finalPayments)
      .filter(([_, amt]) => Number(amt) > 0)
      .map(([mode, amt]) => {
        const pmObj = paymentModes.find((p) => p.name === mode);
        return {
          mode,
          amount: Number(amt),
          type: pmObj?.type || 'non-cash',
        };
      });

    const payload = {
      invoiceNo: activeInvoiceNo || undefined,
      storeId: selectedStore,
      customerId: selectedCustomer?.customerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Client',
      customerMobile: selectedCustomer ? selectedCustomer.mobile : searchMobile || '+91 90000 00000',
      date: billDate,
      items,
      subtotal,
      billDiscountType: discountType,
      billDiscountValue: discountValue,
      discount: billDiscountAmount,
      tax: gstAmount,
      grandTotal,
      tipAmount,
      tipStaffName,
      payableAmount,
      payments: paymentSplits,
      paidAmount: payableAmount,
      changeAmount,
      remarks,
      staffName: user?.name || 'Front Desk Staff',
      staffRole: user?.role || 'staff',
      status: 'Paid',
      visitId: selectedVisitId || undefined,
    };

    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setLastInvoice(data.data);
        setShowReceiptModal(true);
        // Clear screen and remove query params (FR-50)
        handleReset();
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/admin/pos');
        }
        refreshInvoices();
      } else {
        alert(data.message || 'Error completing checkout');
      }
    } catch (err) {
      alert('Failed to save bill');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setActiveInvoiceNo(null);
    setSelectedVisitId(null);
    setItems([]);
    setSelectedCustomer(null);
    setSearchMobile('');
    setMatchingCustomers([]);
    setDiscountValue(0);
    setTipAmount(0);
    setRemarks('');
    setCashTendered(0);
    const initialMap: Record<string, number> = {};
    paymentModes.forEach((pm) => {
      initialMap[pm.name] = 0;
    });
    setPayments(initialMap);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/admin/pos');
    }
  };

  if (isMasterLoading && services.length === 0 && products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 bg-slate-200 rounded-md w-48 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded w-72 animate-pulse" />
          </div>
          <div className="h-8 bg-slate-100 rounded-xl w-32 animate-pulse" />
        </div>
        <PosGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Sale Header matching Figure 3 */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Quick Sale (POS Billing)</h1>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
              Store: [{selectedStore}] {currentStoreObj?.name ? currentStoreObj.name.replace('Nila Clinic - ', '') : selectedStore}
            </span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            FR-40: Collect customer details, add services/products, apply discounts, take split payment, and print bill.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {/* Bill Date */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={billDate}
              disabled={user?.role !== 'admin' && !settings?.backDatedBillingRoles?.includes(user?.role || '')}
              onChange={(e) => setBillDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none text-sm disabled:opacity-60"
            />
          </div>

          <button
            onClick={() => setShowBillList(!showBillList)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xs"
          >
            <Receipt className="w-4 h-4" />
            <span>Recent Bills ({recentBills.length})</span>
          </button>
        </div>
      </div>

      {/* Main Single-Page Quick Sale Layout (Figure 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Customer, Items Grid, Add Items, Discounts, Split Payment, Remarks */}
        <div className="lg:col-span-8 space-y-4">
          {/* Collecting Payment for Doctor Consultation Bill Alert */}
          {activeInvoiceNo && (
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center justify-between text-sm text-amber-950 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  Collecting payment for Doctor Consultation Bill <strong>#{activeInvoiceNo}</strong> ({selectedCustomer?.name || 'Client'})
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-amber-900 underline hover:text-amber-950 font-bold ml-2 text-sm"
              >
                Cancel / New Ticket
              </button>
            </div>
          )}

          {/* 1. Customer Section (FR-20, FR-21, FR-22) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span>1. Customer Details</span>
              {selectedCustomer && (
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md text-xs border border-emerald-200">
                  ✓ Selected: {selectedCustomer.name} ({selectedCustomer.customerId})
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex items-center w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                <span className="font-bold text-slate-500 mr-2">+91</span>
                <input
                  type="text"
                  placeholder="Mobile number [search]..."
                  value={searchMobile}
                  onChange={(e) => handleMobileLookup(e.target.value)}
                  className="w-full bg-transparent outline-none font-semibold text-slate-800 text-sm"
                />
              </div>

              {/* Matching Customers Dropdown */}
              {matchingCustomers.length > 0 && !selectedCustomer && (
                <select
                  onChange={(e) => {
                    const cust = matchingCustomers.find((c) => c.customerId === e.target.value);
                    if (cust) setSelectedCustomer(cust);
                  }}
                  className="w-full sm:w-64 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold"
                >
                  <option value="">Select Matching Client...</option>
                  {matchingCustomers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.name} ({c.customerId}) - {c.firstStoreId}
                    </option>
                  ))}
                </select>
              )}

              {/* Add Client inline button */}
              <button
                type="button"
                onClick={() => setShowInlineAddClient(!showInlineAddClient)}
                className="px-4 py-2 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 font-bold rounded-xl text-sm flex items-center space-x-1.5 whitespace-nowrap shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </button>

              {/* BUG-08: Recent Activity button for consultation-done patients */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRecentActivity(!showRecentActivity)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all shadow-xs ${
                    recentConsultations.length > 0
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                  title="Load completed doctor consultations"
                >
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Recent Activity</span>
                  {recentConsultations.length > 0 && (
                    <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                      {recentConsultations.length}
                    </span>
                  )}
                </button>

                {showRecentActivity && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-30 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
                      <span>Completed Consultations ({recentConsultations.length})</span>
                      <button onClick={() => setShowRecentActivity(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {recentConsultations.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        No pending consultations waiting for billing.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {recentConsultations.map((v) => (
                          <div
                            key={v._id || v.visitId}
                            onClick={() => {
                              setSelectedCustomer({
                                customerId: v.patientId,
                                name: v.patientName,
                                mobile: v.patientPhone,
                                gender: 'Female',
                              } as any);
                              setSearchMobile(v.patientPhone || '');
                              setSelectedVisitId(v.visitId || v._id);

                              // Add doctor consultation item
                              const consultItem: IQuickSaleItem = {
                                type: 'service',
                                itemId: 'svc-5',
                                name: `Doctor Consultation (${v.doctorName || 'Doctor'})`,
                                staffName: v.doctorName || 'Doctor',
                                quantity: 1,
                                price: 500,
                                discountPercent: 0,
                                total: 500,
                              };
                              setItems((prev) => {
                                if (prev.some((it) => it.name.includes('Doctor Consultation'))) return prev;
                                return [...prev, consultItem];
                              });
                              setShowRecentActivity(false);
                            }}
                            className="p-2 hover:bg-amber-50 rounded-xl border border-slate-100 cursor-pointer text-xs space-y-1 transition"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{v.patientName}</span>
                              <span className="text-emerald-700 font-mono">₹500</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{v.patientPhone}</span>
                              <span>Dr. {v.doctorName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inline Add Client Form (FR-22) */}
            {showInlineAddClient && (
              <form onSubmit={handleInlineAddClient} className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-2 text-xs">
                <div className="font-bold text-sky-900 text-[11px]">Inline Client Registration (No separate page needed)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={inlineClientName}
                    onChange={(e) => setInlineClientName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <select
                    value={inlineClientGender}
                    onChange={(e) => setInlineClientGender(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={inlineClientEmail}
                    onChange={(e) => setInlineClientEmail(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Area (Optional)"
                    value={inlineClientArea}
                    onChange={(e) => setInlineClientArea(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInlineAddClient(false)}
                    className="px-3 py-1 text-slate-500 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    Save & Continue Billing
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Items Table & Rows (FR-42, FR-44) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5">
              <span>2. Line Items ({items.length})</span>
              <span className="text-xs text-slate-500 font-normal">Prices loaded from masters</span>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No items added yet. Click <strong>Service</strong> or <strong>Product</strong> below to add.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-3.5 py-2.5">Service / Product *</th>
                      <th className="px-3.5 py-2.5">Attending Staff *</th>
                      <th className="px-3.5 py-2.5 text-center w-16">Qty</th>
                      <th className="px-3.5 py-2.5 text-right w-24">Price (₹)</th>
                      <th className="px-3.5 py-2.5 text-center w-20">Disc %</th>
                      <th className="px-3.5 py-2.5 text-right w-24">Total (₹)</th>
                      <th className="px-2 py-2.5 text-center w-10">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">{it.name}</td>
                        <td className="px-3.5 py-2.5">
                          <select
                            value={it.staffName || ''}
                            onChange={(e) => updateItemField(idx, 'staffName', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 font-medium"
                          >
                            {staffList.map((st) => (
                              <option key={st._id} value={st.name}>
                                {st.name} ({st.designation})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => updateItemField(idx, 'quantity', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-sm"
                          />
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <input
                            type="number"
                            min="0"
                            disabled={!settings?.staffCanEditPrice && user?.role !== 'admin'}
                            value={it.price}
                            onChange={(e) => updateItemField(idx, 'price', Math.max(0, Number(e.target.value) || 0))}
                            className="w-24 text-right bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-sm disabled:opacity-60"
                          />
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={user?.role === 'admin' ? 100 : (settings?.maxStaffDiscountPercent || 10)}
                            value={it.discountPercent || 0}
                            onChange={(e) => {
                              const raw = Math.max(0, parseFloat(e.target.value) || 0);
                              const maxAllowed = user?.role === 'admin' ? 100 : (settings?.maxStaffDiscountPercent || 10);
                              updateItemField(idx, 'discountPercent', Math.min(maxAllowed, raw));
                            }}
                            className="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 text-sm font-semibold"
                          />
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-black text-slate-900 text-sm">₹{it.total}</td>
                        <td className="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Items Action Bar (Figure 3) */}
            <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-sm">
              <span className="font-bold text-slate-600 mr-1">Add items:</span>
              <button
                type="button"
                onClick={() => setShowCatalogModal('service')}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Service</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogModal('product')}
                className="px-3.5 py-2 bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200 rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs"
              >
                <Package className="w-4 h-4 text-sky-600" />
                <span>Product</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogModal('package')}
                className="px-3.5 py-2 bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs"
              >
                <Package className="w-4 h-4 text-purple-600" />
                <span>Package</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCustomer) {
                    alert('Please search or select a customer first to check active package sittings.');
                    return;
                  }
                  setShowRedeemPackageModal(true);
                }}
                className="px-3.5 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold flex items-center space-x-1.5 shadow-2xs"
              >
                <span>Use Customer Package</span>
                {customerPackages.length > 0 && (
                  <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {customerPackages.reduce((acc, p) => acc + (p.remainingSittings || 0), 0)} left
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 3. Discounts & Tips (FR-45, FR-48) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Bill Discount (by value OR by percent) */}
            <div className="space-y-2">
              <span className="font-black text-slate-900 block text-sm">3. Bill Discount (One at a time)</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs ${discountType === 'percent' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                >
                  By % (Percent)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('value')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs ${discountType === 'value' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                >
                  By ₹ (Value)
                </button>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percent' ? (user?.role === 'admin' ? 100 : (settings?.maxStaffDiscountPercent || 10)) : subtotal}
                  value={discountValue || ''}
                  placeholder={discountType === 'percent' ? 'e.g. 10%' : 'e.g. ₹500'}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    if (discountType === 'percent') {
                      const maxLimit = user?.role === 'admin' ? 100 : (settings?.maxStaffDiscountPercent || 10);
                      setDiscountValue(Math.min(maxLimit, val));
                    } else {
                      setDiscountValue(Math.min(subtotal, val));
                    }
                  }}
                  className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm"
                />
              </div>
              <span className="text-xs text-slate-500 block font-medium">
                Max staff discount limit: <strong>{settings?.maxStaffDiscountPercent || 10}%</strong>
              </span>
            </div>

            {/* Optional Tip against Staff (FR-48) */}
            <div className="space-y-2">
              <span className="font-black text-slate-900 block text-sm">Add Tip (Optional)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Tip Amount (₹)"
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm"
                />
                <select
                  value={tipStaffName}
                  onChange={(e) => setTipStaffName(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">Attribute Tip to Staff...</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Split Payment Mode (FR-46) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between text-sm font-black text-slate-900">
              <span>4. Mode of Payment (Split Allowed across modes)</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold ${Math.abs(balanceRemaining) < 0.01 ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {Math.abs(balanceRemaining) < 0.01 ? '✓ Balanced' : `Balance Remaining: ₹${balanceRemaining.toFixed(2)}`}
                </span>
                {Math.abs(balanceRemaining) >= 0.01 && (
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    Auto-Balance
                  </button>
                )}
              </div>
            </div>

            {/* Quick 1-click full payment buttons */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-xs text-slate-500 font-bold uppercase mr-1">Pay All With:</span>
              {paymentModes.map((pm) => (
                <button
                  key={pm.name}
                  type="button"
                  onClick={() => setExactPaymentMode(pm.name)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs"
                >
                  {pm.name}
                </button>
              ))}
            </div>

            {/* Mode and Amount Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {paymentModes.map((pm) => (
                <div key={pm.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{pm.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">{pm.type}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={payments[pm.name] || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPayments({
                        ...payments,
                        [pm.name]: val,
                      });
                      if (pm.name === 'Cash') {
                        setCashTendered(val);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-black text-sm text-slate-900"
                  />
                </div>
              ))}
            </div>

            {/* Cash Tendered & Change (only cash gives change: Section 10) */}
            {(effectiveCashApplied > 0 || cashRaw > 0) && (
              <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-950 text-sm">Cash Tendered by Patient:</span>
                      <span className="text-xs bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-200">
                        Currency Note given
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Actual cash/note received (e.g. ₹2,000 note for ₹1,800 bill)
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <input
                        type="number"
                        min="0"
                        value={cashTendered > 0 ? cashTendered : (cashRaw > 0 ? cashRaw : '')}
                        placeholder={`e.g. ₹${effectiveCashApplied}`}
                        onChange={(e) => setCashTendered(Number(e.target.value))}
                        className="w-32 px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-black text-sm text-slate-900 shadow-xs focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCashTendered(effectiveCashApplied)}
                        className="px-2.5 py-1.5 bg-white hover:bg-amber-100 border border-amber-200 rounded text-xs font-bold text-amber-900 shadow-xs"
                      >
                        Exact (₹{effectiveCashApplied})
                      </button>
                      {[500, 1000, 2000].map((note) => (
                        note >= effectiveCashApplied && (
                          <button
                            key={note}
                            type="button"
                            onClick={() => setCashTendered(note)}
                            className="px-2.5 py-1.5 bg-white hover:bg-amber-100 border border-amber-200 rounded text-xs font-bold text-amber-900 shadow-xs"
                          >
                            ₹{note} Note
                          </button>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-amber-200/80 sm:pl-4">
                    <span className="text-xs text-amber-900 font-bold block">Cash Change to Return:</span>
                    <span className={`text-2xl font-black ${changeAmount > 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                      ₹{changeAmount.toFixed(2)}
                    </span>
                    {changeAmount > 0 && (
                      <span className="text-xs text-emerald-800 font-bold block mt-0.5">
                        (₹{effectiveCashTendered} received − ₹{effectiveCashApplied} bill)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Remarks */}
            <div>
              <input
                type="text"
                placeholder="Billing remarks / special notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Totals & Action Buttons (Figure 3) */}
        <div className="lg:col-span-4 sticky top-20 self-start bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-2.5">
              Billing Summary & Totals
            </h3>

            <div className="space-y-2.5 text-sm text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {billDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Bill Discount ({discountType === 'percent' ? `${discountValue}%` : 'Flat'})</span>
                  <span className="font-bold">-₹{billDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {isGstOn && (
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="font-black text-slate-900">₹{grandTotal.toFixed(2)}</span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between text-indigo-700 text-sm font-medium">
                  <span>Staff Tip {tipStaffName ? `(${tipStaffName})` : ''}</span>
                  <span className="font-bold">+₹{tipAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-base font-black text-slate-900 pt-2.5 border-t border-slate-300">
                <span>Payable Amount</span>
                <span className="text-emerald-700 text-2xl font-black">₹{payableAmount.toFixed(2)}</span>
              </div>

              {(effectiveCashApplied > 0 || cashRaw > 0) && (
                <div className="flex justify-between text-sm text-slate-600 pt-1 font-medium">
                  <span>Cash Change to Return</span>
                  <span className={`font-bold ${changeAmount > 0 ? 'text-emerald-700 font-black text-base' : 'text-slate-800'}`}>
                    ₹{changeAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (Reset & Save + Print) */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <ButtonLoader
              type="button"
              onClick={handleSaveBill}
              isLoading={isProcessing}
              loadingText="Processing & Printing..."
              disabled={items.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Printer className="w-5 h-5 mr-1.5" />
              <span>Save + Print (₹{payableAmount.toFixed(2)})</span>
            </ButtonLoader>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Modal (Add Service / Product / Package) */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-5 relative max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">
                  Select {showCatalogModal === 'service' ? 'Treatment Service' : showCatalogModal === 'product' ? 'Retail Product' : 'Treatment Package'} to Add
                </h3>
                <button onClick={() => setShowCatalogModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 max-h-96 overflow-y-auto pr-1">
                {showCatalogModal === 'service' &&
                  services.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => addItemToBill(s, 'service')}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">{s.name}</h4>
                        <span className="text-[10px] text-slate-400">{s.category} • {s.duration} mins</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">₹{s.price}</span>
                    </div>
                  ))}

                {showCatalogModal === 'product' &&
                  products.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => addItemToBill(p, 'product')}
                      className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                        <span className="text-[10px] text-slate-400">{p.category} {p.sku ? `• ${p.sku}` : ''}</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">₹{p.price}</span>
                    </div>
                  ))}

                {showCatalogModal === 'package' &&
                  packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      onClick={() => addPackageToBill(pkg)}
                      className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-slate-900">{pkg.name}</h4>
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">{pkg.type}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {pkg.totalSittings} sittings • Valid {pkg.validityDays} days
                        </span>
                      </div>
                      <span className="font-black text-purple-700 text-sm">₹{pkg.price}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setShowCatalogModal(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Package Sittings Redemption Modal (FR-36) */}
      {showRedeemPackageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-5 relative max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Redeem Client Package Sitting
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Client: <strong>{selectedCustomer?.name}</strong> ({selectedCustomer?.mobile})
                  </p>
                </div>
                <button onClick={() => setShowRedeemPackageModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mt-3 max-h-96 overflow-y-auto pr-1">
                {customerPackages.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active packages found for this client.
                  </div>
                ) : (
                  customerPackages.map((cp) => (
                    <div key={cp._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{cp.packageName}</h4>
                          <span className="text-[10px] text-slate-500">
                            Purchased at: {cp.storeSold} • Expires: {cp.validityExpiryDate}
                          </span>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {cp.remainingSittings} of {cp.totalSittings} sittings left
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                          Click Treatment to Redeem (Added at ₹0):
                        </span>
                        <div className="space-y-1">
                          {cp.servicesRemaining.map((svc, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              disabled={svc.remainingCount <= 0 || cp.status !== 'Active'}
                              onClick={() => redeemSittingToBill(cp, svc.serviceName)}
                              className="w-full text-left p-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs flex justify-between items-center transition disabled:opacity-40 disabled:hover:bg-white"
                            >
                              <span className="font-medium text-slate-800">{svc.serviceName}</span>
                              <span className="text-[11px] font-bold text-emerald-600">
                                {svc.remainingCount} remaining → Use Sitting
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setShowRedeemPackageModal(false)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal (FR-51: 80mm or A4) */}
      {showReceiptModal && lastInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div id="printable-receipt" className="text-center space-y-3 font-mono text-xs text-slate-800">
              <div className="border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">
                  {settings?.clinicName || 'NILA CLINIC'}
                </h2>
                <p className="text-[10px] text-slate-600 font-bold">{currentStoreObj?.name || 'Skin & Hair Care Center'}</p>
                <p className="text-[10px] text-slate-500">{currentStoreObj?.address || 'Tamil Nadu'}</p>
                <p className="text-[10px] text-slate-500">
                  GSTIN: {currentStoreObj?.gstin || settings?.gstin || '33ABCDE1234F1Z5'} • Tel: {currentStoreObj?.phone || '+91 98450 11223'}
                </p>
                <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded">
                  INVOICE: {lastInvoice.invoiceNo}
                </div>
              </div>

              <div className="text-left space-y-1 text-[11px]">
                <p><strong>Patient:</strong> {lastInvoice.customerName}</p>
                <p><strong>Mobile:</strong> {lastInvoice.customerMobile || lastInvoice.customerPhone || '-'}</p>
                <p><strong>Date:</strong> {lastInvoice.date} {lastInvoice.createdAt ? `(${new Date(lastInvoice.createdAt).toLocaleTimeString()})` : ''}</p>
                <p><strong>Billed By:</strong> {lastInvoice.staffName}</p>
              </div>

              <table className="w-full text-left text-[11px] border-t border-b border-dashed border-slate-300 py-2">
                <thead>
                  <tr className="font-bold border-b border-slate-200">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(lastInvoice.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1">
                        <div>{it.name}</div>
                        {it.staffName && <span className="text-[9px] text-slate-400">By: {it.staffName}</span>}
                      </td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">₹{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right space-y-1 text-[11px]">
                <p>Subtotal: ₹{lastInvoice.subtotal}</p>
                {lastInvoice.discount > 0 && <p className="text-emerald-600">Discount: -₹{lastInvoice.discount}</p>}
                {lastInvoice.tax > 0 && <p>GST (18%): ₹{lastInvoice.tax}</p>}
                {lastInvoice.tipAmount ? <p className="text-indigo-600">Tip: +₹{lastInvoice.tipAmount}</p> : null}
                <p className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-300">
                  Total Paid: ₹{lastInvoice.payableAmount || lastInvoice.grandTotal}
                </p>

                {/* Payments Split Breakdown */}
                <div className="pt-1 text-[10px] text-slate-500">
                  {lastInvoice.payments?.map((p, i) => (
                    <p key={i}>
                      {p.mode}: ₹{p.amount}
                    </p>
                  ))}
                  {lastInvoice.changeAmount ? (
                    <p className="font-bold text-slate-700">Cash Change: ₹{lastInvoice.changeAmount}</p>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500">
                <p>{settings?.billFooter || 'Thank you for choosing Nila Clinic!'}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill ({settings?.printSize || '80mm'})</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            {/* If package sitting or sale was involved, prompt to set next sitting on calendar */}
            {lastInvoice && (lastInvoice.items || []).some((i) => i.type === 'package' || i.type === 'package_use' || i.isFromPackage) && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-purple-900 block">Package Sitting Processed (1 of {customerPackages[0]?.totalSittings || 4})</span>
                  <span className="text-[11px] text-purple-700">Remaining sessions can now be scheduled directly on the calendar.</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  {customerPackages.length > 0 && customerPackages[0].remainingSittings > 0 && (
                    <button
                      type="button"
                      onClick={() => setSchedulingPackage(customerPackages[0])}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Remaining ({customerPackages[0].remainingSittings}) on Calendar</span>
                    </button>
                  )}
                  <Link
                    href={`/admin/appointments?customerId=${encodeURIComponent(lastInvoice.customerId || '')}&customerName=${encodeURIComponent(lastInvoice.customerName)}&customerPhone=${encodeURIComponent(lastInvoice.customerMobile || '')}`}
                    className="px-2.5 py-1.5 bg-white border border-purple-300 text-purple-800 hover:bg-purple-100 font-semibold rounded-lg text-xs"
                  >
                    Open Calendar →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bill List Drawer (FR-53) */}
      {showBillList && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 p-5 flex flex-col justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent POS Sales - [{selectedStore}]</h3>
                <p className="text-[11px] text-slate-400">Differentiated by Services, Products & Packages</p>
              </div>
              <button onClick={() => setShowBillList(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product / Service Filter Tabs (MioSalon POS Style) */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRecentBillFilter('ALL')}
                className={`py-1.5 rounded-lg text-center transition-all ${recentBillFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                All ({recentBills.length})
              </button>
              <button
                type="button"
                onClick={() => setRecentBillFilter('services')}
                className={`py-1.5 rounded-lg text-center transition-all ${recentBillFilter === 'services' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Services
              </button>
              <button
                type="button"
                onClick={() => setRecentBillFilter('products')}
                className={`py-1.5 rounded-lg text-center transition-all ${recentBillFilter === 'products' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => setRecentBillFilter('packages')}
                className={`py-1.5 rounded-lg text-center transition-all ${recentBillFilter === 'packages' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                Packages
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {recentBills
                .filter((bill) => {
                  if (recentBillFilter === 'ALL') return true;
                  const hasServices = (bill.items || []).some(
                    (i) => i.type === 'service' || i.type === 'package_use' || !i.type
                  );
                  const hasProducts = (bill.items || []).some((i) => i.type === 'product');
                  const hasPackages = (bill.items || []).some((i) => i.type === 'package');
                  if (recentBillFilter === 'services') return hasServices;
                  if (recentBillFilter === 'products') return hasProducts;
                  if (recentBillFilter === 'packages') return hasPackages;
                  return true;
                })
                .map((bill) => {
                  const serviceItems = (bill.items || []).filter(
                    (i) => i.type === 'service' || i.type === 'package_use' || !i.type
                  );
                  const productItems = (bill.items || []).filter((i) => i.type === 'product');
                  const packageItems = (bill.items || []).filter((i) => i.type === 'package');

                  return (
                    <div key={bill._id || bill.invoiceNo} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs space-y-2 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-700 text-xs">{bill.invoiceNo}</span>
                        <span className="font-black text-slate-900 text-sm">₹{bill.payableAmount || bill.grandTotal}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{bill.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{bill.date}</span>
                      </div>

                      {/* Product vs Service Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {serviceItems.length > 0 && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Service ({serviceItems.length})</span>
                          </span>
                        )}
                        {productItems.length > 0 && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100/70 text-sky-800 border border-sky-200">
                            <Package className="w-3 h-3 text-sky-600" />
                            <span>Product ({productItems.length})</span>
                          </span>
                        )}
                        {packageItems.length > 0 && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100/70 text-purple-800 border border-purple-200">
                            <Package className="w-3 h-3 text-purple-600" />
                            <span>Package ({packageItems.length})</span>
                          </span>
                        )}
                      </div>

                      {/* Detailed item names preview */}
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-1">
                        {(bill.items || []).map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                            <div className="flex items-center space-x-1.5 truncate pr-2">
                              <span
                                className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded ${it.type === 'product'
                                    ? 'bg-sky-50 text-sky-700'
                                    : it.type === 'package'
                                      ? 'bg-purple-50 text-purple-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                              >
                                {it.type === 'product' ? 'Product' : it.type === 'package' ? 'Package' : 'Service'}
                              </span>
                              <span className="truncate">{it.name}</span>
                              <span className="text-slate-400">×{it.quantity}</span>
                            </div>
                            <span className="font-bold text-slate-800 shrink-0">₹{it.total}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Paid via: <strong className="text-slate-700">{bill.paymentMethod || 'Split'}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            setLastInvoice(bill);
                            setShowReceiptModal(true);
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 hover:bg-slate-200 font-bold rounded-lg text-[10px] transition"
                        >
                          Reprint Bill
                        </button>
                      </div>
                    </div>
                  );
                })}

              {recentBills.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">No recent sales found for this store.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Multi-Session Calendar Scheduler Modal */}
      {schedulingPackage && (selectedCustomer || lastInvoice) && (
        <PackageSchedulerModal
          isOpen={Boolean(schedulingPackage)}
          onClose={() => setSchedulingPackage(null)}
          customer={{
            customerId: (selectedCustomer?.customerId || lastInvoice?.customerId) as any,
            name: selectedCustomer?.name || lastInvoice?.customerName || 'Client',
            mobile: selectedCustomer?.mobile || lastInvoice?.customerMobile || '',
          }}
          customerPackage={schedulingPackage}
          staffMembers={staffList}
          storeId={selectedStore}
          onSuccess={() => {
            alert('Remaining sessions booked on Appointment Calendar!');
          }}
        />
      )}
    </div>
  );
}

export default function QuickSalePOSPage() {
  return (
    <Suspense fallback={<PosGridSkeleton />}>
      <QuickSalePOSContent />
    </Suspense>
  );
}
