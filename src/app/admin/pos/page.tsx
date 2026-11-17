'use client';

import React, { useState, useEffect } from 'react';
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

export default function QuickSalePOSPage() {
  const { user, selectedStore, stores, currentStoreObj } = useClinic();

  // Masters
  const [services, setServices] = useState<IService[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [packages, setPackages] = useState<IPackageMaster[]>([]);
  const [staffList, setStaffList] = useState<IStaff[]>([]);
  const [paymentModes, setPaymentModes] = useState<IPaymentMode[]>([]);
  const [settings, setSettings] = useState<IClinicSettings | null>(null);

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
  const [recentBills, setRecentBills] = useState<IInvoice[]>([]);

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

  // Load masters on store change
  const loadMasters = async () => {
    try {
      const [sRes, pRes, pkgRes, stRes, pmRes, setRes, invRes] = await Promise.all([
        fetch(`/api/masters/services?storeCode=${selectedStore}`),
        fetch(`/api/masters/products?storeCode=${selectedStore}`),
        fetch(`/api/packages?storeCode=${selectedStore}`),
        fetch(`/api/masters/staff?storeCode=${selectedStore}`),
        fetch('/api/masters/payment-modes'),
        fetch('/api/masters/settings'),
        fetch(`/api/invoices?storeCode=${selectedStore}`),
      ]);

      const sData = await sRes.json();
      const pData = await pRes.json();
      const pkgData = await pkgRes.json();
      const stData = await stRes.json();
      const pmData = await pmRes.json();
      const setData = await setRes.json();
      const invData = await invRes.json();

      if (sData.success) setServices(sData.data);
      if (pData.success) setProducts(pData.data);
      if (pkgData.success) setPackages(pkgData.data);
      if (stData.success) setStaffList(stData.data);
      if (pmData.success) {
        setPaymentModes(pmData.data);
        // Initialize default payments map
        const initialMap: Record<string, number> = {};
        pmData.data.forEach((pm: IPaymentMode) => {
          initialMap[pm.name] = 0;
        });
        setPayments(initialMap);
      }
      if (setData.success) setSettings(setData.data);
      if (invData.success) setRecentBills(invData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMasters();
  }, [selectedStore]);

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

  // Real-time mobile lookup (FR-20 & FR-21)
  const handleMobileLookup = async (mob: string) => {
    setSearchMobile(mob);
    setSelectedCustomer(null);
    setShowInlineAddClient(false);

    if (mob.trim().length >= 4) {
      try {
        const res = await fetch(`/api/customers?mobile=${encodeURIComponent(mob)}`);
        const data = await res.json();
        if (data.success) {
          setMatchingCustomers(data.data || []);
          if (data.data.length === 1) {
            setSelectedCustomer(data.data[0]);
          }
        }
      } catch (e) {}
    } else {
      setMatchingCustomers([]);
    }
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

    setItems([...items, newItem]);
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

    setItems([...items, newItem]);
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
      staffId: defaultStaffId,
      staffName: defaultStaff,
      quantity: 1,
      price: 0,
      discountPercent: 0,
      total: 0,
      isFromPackage: true,
    };

    setItems([...items, newItem]);
    setShowRedeemPackageModal(false);
  };

  const updateItemField = (index: number, field: keyof IQuickSaleItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    // Recalculate row total
    const qty = Number(updated[index].quantity) || 1;
    const price = Number(updated[index].price) || 0;
    const discPct = Number(updated[index].discountPercent) || 0;
    const lineTotal = Math.round(qty * price * (1 - discPct / 100));
    updated[index].total = lineTotal;

    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Calculations (Section 10 Calculation Rules)
  const subtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);

  // Bill discount
  let billDiscountAmount = 0;
  if (discountType === 'percent') {
    billDiscountAmount = Math.round((subtotal * (discountValue || 0)) / 100);
  } else {
    billDiscountAmount = Number(discountValue) || 0;
  }
  if (billDiscountAmount > subtotal) billDiscountAmount = subtotal;

  // GST (if enabled in settings)
  const isGstOn = Boolean(settings?.gstOnBills);
  const gstAmount = isGstOn ? Math.round((subtotal - billDiscountAmount) * 0.18) : 0;

  const grandTotal = subtotal - billDiscountAmount + gstAmount;
  const payableAmount = grandTotal + (Number(tipAmount) || 0);

  // Payment splits calculation
  const totalPaidAcrossModes = Object.values(payments).reduce((acc, v) => acc + (Number(v) || 0), 0);
  const balanceRemaining = payableAmount - totalPaidAcrossModes;

  // Change amount calculation (for cash only: FR-21)
  const cashAmountEntered = payments['Cash'] || 0;
  const changeAmount = cashTendered > cashAmountEntered ? cashTendered - cashAmountEntered : 0;

  // Set single payment mode helper
  const setExactPaymentMode = (modeName: string) => {
    const newPayments: Record<string, number> = {};
    paymentModes.forEach((pm) => {
      newPayments[pm.name] = pm.name === modeName ? payableAmount : 0;
    });
    setPayments(newPayments);
    if (modeName === 'Cash') {
      setCashTendered(payableAmount);
    }
  };

  // Save Bill (FR-50, FR-51)
  const handleSaveBill = async () => {
    if (items.length === 0) {
      alert('Billing ticket is empty. Please add services or products.');
      return;
    }

    if (Math.abs(balanceRemaining) > 0.5) {
      alert(`Split payments total (₹${totalPaidAcrossModes}) must equal payable amount (₹${payableAmount}). Balance remaining: ₹${balanceRemaining}`);
      return;
    }

    setIsProcessing(true);

    const paymentSplits: IPaymentSplit[] = Object.entries(payments)
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
      paidAmount: totalPaidAcrossModes,
      changeAmount,
      remarks,
      staffName: user?.name || 'Front Desk Staff',
      staffRole: user?.role || 'staff',
      status: 'Paid',
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
        // Clear screen (FR-50)
        handleReset();
        await loadMasters();
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
  };

  return (
    <div className="space-y-4">
      {/* Quick Sale Header matching Figure 3 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Quick Sale (POS Billing)</h1>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Store: [{selectedStore}] {currentStoreObj?.name ? currentStoreObj.name.replace('Nila Clinic - ', '') : selectedStore}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            FR-40: Collect customer details, add services/products, apply discounts, take split payment, and print bill.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* Bill Date */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={billDate}
              disabled={user?.role !== 'admin' && !settings?.backDatedBillingRoles?.includes(user?.role || '')}
              onChange={(e) => setBillDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none text-xs disabled:opacity-60"
            />
          </div>

          <button
            onClick={() => setShowBillList(!showBillList)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Recent Bills ({recentBills.length})</span>
          </button>
        </div>
      </div>

      {/* Main Single-Page Quick Sale Layout (Figure 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Customer, Items Grid, Add Items, Discounts, Split Payment, Remarks */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. Customer Section (FR-20, FR-21, FR-22) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>1. Customer Details</span>
              {selectedCustomer && (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  ✓ Selected: {selectedCustomer.name} ({selectedCustomer.customerId})
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex items-center w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="font-bold text-slate-400 mr-1.5">+91</span>
                <input
                  type="text"
                  placeholder="Mobile number [search]..."
                  value={searchMobile}
                  onChange={(e) => handleMobileLookup(e.target.value)}
                  className="w-full bg-transparent outline-none font-semibold text-slate-800 text-xs"
                />
              </div>

              {/* Matching Customers Dropdown */}
              {matchingCustomers.length > 0 && !selectedCustomer && (
                <select
                  onChange={(e) => {
                    const cust = matchingCustomers.find((c) => c.customerId === e.target.value);
                    if (cust) setSelectedCustomer(cust);
                  }}
                  className="w-full sm:w-60 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                >
                  <option value="">Select Matching Client...</option>
                  {matchingCustomers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.name} ({c.customerId}) - {c.firstStoreId}
                    </option>
                  ))}
                </select>
              )}

              {/* + Add Client inline button */}
              <button
                type="button"
                onClick={() => setShowInlineAddClient(!showInlineAddClient)}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold rounded-xl text-xs flex items-center space-x-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Client</span>
              </button>
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
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              <span>2. Line Items ({items.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">Prices loaded from masters</span>
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No items added yet. Click <strong>+ Service</strong> or <strong>+ Product</strong> below to add.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3 py-2">Service / Product *</th>
                      <th className="px-3 py-2">Attending Staff *</th>
                      <th className="px-3 py-2 text-center w-16">Qty</th>
                      <th className="px-3 py-2 text-right w-24">Price (₹)</th>
                      <th className="px-3 py-2 text-center w-20">Disc %</th>
                      <th className="px-3 py-2 text-right w-24">Total (₹)</th>
                      <th className="px-2 py-2 text-center w-10">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-bold text-slate-900">{it.name}</td>
                        <td className="px-3 py-2">
                          <select
                            value={it.staffName || ''}
                            onChange={(e) => updateItemField(idx, 'staffName', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                          >
                            {staffList.map((st) => (
                              <option key={st._id} value={st.name}>
                                {st.name} ({st.designation})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => updateItemField(idx, 'quantity', Number(e.target.value))}
                            className="w-14 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            disabled={!settings?.staffCanEditPrice && user?.role !== 'admin'}
                            value={it.price}
                            onChange={(e) => updateItemField(idx, 'price', Number(e.target.value))}
                            className="w-20 text-right bg-slate-50 border border-slate-200 rounded-lg py-1 font-bold text-xs disabled:opacity-60"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={it.discountPercent || 0}
                            onChange={(e) => updateItemField(idx, 'discountPercent', Number(e.target.value))}
                            className="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-black text-slate-900">₹{it.total}</td>
                        <td className="px-2 py-2 text-center">
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
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 mr-1">Add items:</span>
              <button
                type="button"
                onClick={() => setShowCatalogModal('service')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Service</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogModal('product')}
                className="px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 rounded-xl font-bold flex items-center space-x-1"
              >
                <Package className="w-3.5 h-3.5" />
                <span>+ Product</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogModal('package')}
                className="px-3 py-1.5 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 rounded-xl font-bold flex items-center space-x-1"
              >
                <Package className="w-3.5 h-3.5" />
                <span>+ Package</span>
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
                className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold flex items-center space-x-1"
              >
                <span>Use Customer Package</span>
                {customerPackages.length > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {customerPackages.reduce((acc, p) => acc + (p.remainingSittings || 0), 0)} left
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 3. Discounts & Tips (FR-45, FR-48) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Bill Discount (by value OR by percent) */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">3. Bill Discount (One at a time)</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    discountType === 'percent' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  By % (Percent)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('value')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    discountType === 'value' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  By ₹ (Value)
                </button>
                <input
                  type="number"
                  min="0"
                  value={discountValue || ''}
                  placeholder={discountType === 'percent' ? 'e.g. 10%' : 'e.g. ₹500'}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-28 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Max staff discount limit: <strong>{settings?.maxStaffDiscountPercent || 10}%</strong>
              </span>
            </div>

            {/* Optional Tip against Staff (FR-48) */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Add Tip (Optional)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Tip Amount (₹)"
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(Number(e.target.value))}
                  className="w-28 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs"
                />
                <select
                  value={tipStaffName}
                  onChange={(e) => setTipStaffName(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>4. Mode of Payment (Split Allowed across modes)</span>
              <span className={`text-[11px] font-bold ${balanceRemaining === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {balanceRemaining === 0 ? '✓ Balanced' : `Balance Remaining: ₹${balanceRemaining}`}
              </span>
            </div>

            {/* Quick 1-click full payment buttons */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Pay All With:</span>
              {paymentModes.map((pm) => (
                <button
                  key={pm.name}
                  type="button"
                  onClick={() => setExactPaymentMode(pm.name)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px]"
                >
                  {pm.name}
                </button>
              ))}
            </div>

            {/* Mode and Amount Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {paymentModes.map((pm) => (
                <div key={pm.name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{pm.name}</span>
                    <span className="text-[9px] text-slate-400">{pm.type}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={payments[pm.name] || ''}
                    onChange={(e) => {
                      setPayments({
                        ...payments,
                        [pm.name]: Number(e.target.value),
                      });
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-black text-xs text-slate-900"
                  />
                </div>
              ))}
            </div>

            {/* Cash Tendered & Change (only cash gives change: Section 10) */}
            {(payments['Cash'] || 0) > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900 block">Cash Tendered by Patient:</span>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    placeholder={`e.g. ₹${payments['Cash']}`}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-28 mt-1 px-2.5 py-1 bg-white border border-amber-300 rounded font-black text-xs text-slate-900"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-amber-800 font-semibold block">Change to Return (Cash only):</span>
                  <span className="text-lg font-black text-emerald-700">₹{changeAmount}</span>
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
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Totals & Action Buttons (Figure 3) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
              Billing Summary & Totals
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>

              {billDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Bill Discount ({discountType === 'percent' ? `${discountValue}%` : 'Flat'})</span>
                  <span className="font-bold">-₹{billDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              {isGstOn && (
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {tipAmount > 0 && (
                <div className="flex justify-between text-indigo-600 text-xs">
                  <span>Staff Tip {tipStaffName ? `(${tipStaffName})` : ''}</span>
                  <span className="font-bold">+₹{tipAmount}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Payable Amount</span>
                <span className="text-emerald-700 text-xl">₹{payableAmount.toFixed(2)}</span>
              </div>

              {(payments['Cash'] || 0) > 0 && (
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>Cash Change to Return</span>
                  <span className="font-bold text-slate-800">₹{changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (Reset & Save + Print) */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveBill}
              disabled={isProcessing || items.length === 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : `Save + Print (₹${payableAmount})`}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
          </div>
        </div>
      )}

      {/* Bill List Drawer (FR-53) */}
      {showBillList && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Recent Bills - [{selectedStore}]</h3>
              <button onClick={() => setShowBillList(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
              {recentBills.map((bill) => (
                <div key={bill._id || bill.invoiceNo} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700">{bill.invoiceNo}</span>
                    <span className="font-black text-slate-900">₹{bill.payableAmount || bill.grandTotal}</span>
                  </div>
                  <div className="font-bold text-slate-800">{bill.customerName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{bill.date}</span>
                    <span>{bill.paymentMethod || 'Split Payment'}</span>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setLastInvoice(bill);
                        setShowReceiptModal(true);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-lg text-[10px]"
                    >
                      Reprint Bill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
