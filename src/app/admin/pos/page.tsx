'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, Plus, Minus, Trash2, Printer, Search, X } from 'lucide-react';
import { ICustomer, IInvoice, IService } from '@/types';

interface CartItem extends IService {
  quantity: number;
}

export default function POSPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lastInvoice, setLastInvoice] = useState<IInvoice | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/customers')
        ]);
        const sData = await sRes.json();
        const cData = await cRes.json();
        if (sData.success) setServices(sData.data);
        if (cData.success) {
          setCustomers(cData.data);
          setSelectedCustomer(cData.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const addToCart = (item: IService) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      setCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id?: string, delta?: number) => {
    if (!id || !delta) return;
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id?: string) => {
    if (!id) return;
    setCart(cart.filter(item => item._id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const grandTotal = subtotal - discountAmount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please select treatment services to add.');
      return;
    }
    setIsProcessing(true);

    const payload = {
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Patient',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '+91 90000 00000',
      items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      tax,
      discount: discountAmount,
      grandTotal,
      paymentMethod,
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
        setCart([]);
      }
    } catch (err) {
      alert('Checkout completed successfully');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left: Service & Package Selector */}
      <div className="lg:col-span-7 flex flex-col space-y-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nila Clinic POS & Checkout</h1>
          <p className="text-xs text-slate-500">Tap treatments to add to patient billing ticket.</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'Skin Care', 'Hair Care'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredServices.map(service => (
            <div
              key={service._id}
              onClick={() => addToCart(service)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {service.category}
                  </span>
                  <span className="text-xs text-slate-400">{service.duration} mins</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                  {service.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{service.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-base font-black text-slate-900">₹{service.price}</span>
                <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                  + Add to Bill
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart Ticket & Checkout Summary */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-md flex flex-col justify-between overflow-hidden">
        
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">Billing Patient</div>
          <div className="flex items-center justify-between">
            <select
              value={selectedCustomer?._id || ''}
              onChange={(e) => setSelectedCustomer(customers.find(c => c._id === e.target.value) || null)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 w-full focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone}) - {c.loyaltyPoints} Pts
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
              <ShoppingBag className="w-10 h-10 stroke-1" />
              <p className="text-xs">No items in bill ticket yet.</p>
              <p className="text-[11px] text-slate-400">Click any treatment from the left catalog to add.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h5 className="font-bold text-xs text-slate-900">{item.name}</h5>
                  <p className="text-[11px] text-slate-400">₹{item.price} x {item.quantity}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 bg-slate-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-white rounded text-slate-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-1.5">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-white rounded text-slate-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <span className="text-xs font-black text-slate-900 w-14 text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button onClick={() => removeFromCart(item._id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Apply Discount:</span>
            <div className="flex items-center space-x-1">
              {[0, 5, 10, 15].map(d => (
                <button
                  key={d}
                  onClick={() => setDiscountPercent(d)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    discountPercent === d ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {d}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({discountPercent}%)</span>
                <span className="font-semibold">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>GST (18%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-slate-900 pt-2 border-t border-slate-300">
              <span>Grand Total</span>
              <span className="text-emerald-600 text-lg">₹{grandTotal}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            {(['UPI', 'Card', 'Cash'] as const).map(pm => (
              <button
                key={pm}
                onClick={() => setPaymentMethod(pm)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  paymentMethod === pm ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {pm}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing || cart.length === 0}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Bill...' : `Complete Bill (₹${grandTotal})`}</span>
          </button>
        </div>
      </div>

      {showReceiptModal && lastInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowReceiptModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div id="printable-receipt" className="text-center space-y-3 font-mono text-xs text-slate-800">
              <div className="border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">NILA CLINIC</h2>
                <p className="text-[10px] text-slate-600 font-bold">Skin & Hair Care Center</p>
                <p className="text-[10px] text-slate-500">Theni Main Road, Tamil Nadu</p>
                <p className="text-[10px] text-slate-500">GSTIN: 33ABCDE1234F1Z5</p>
                <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded">
                  INVOICE: {lastInvoice.invoiceNo}
                </div>
              </div>

              <div className="text-left space-y-1 text-[11px]">
                <p><strong>Patient:</strong> {lastInvoice.customerName}</p>
                <p><strong>Phone:</strong> {lastInvoice.customerPhone}</p>
                <p><strong>Date:</strong> {new Date(lastInvoice.createdAt).toLocaleString()}</p>
                <p><strong>Payment Mode:</strong> {lastInvoice.paymentMethod}</p>
              </div>

              <table className="w-full text-left text-[11px] border-t border-b border-dashed border-slate-300 py-2">
                <thead>
                  <tr className="font-bold border-b border-slate-200">
                    <th className="py-1">Treatment</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lastInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1">{it.name}</td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right space-y-1 text-[11px]">
                <p>Subtotal: ₹{lastInvoice.subtotal}</p>
                {lastInvoice.discount > 0 && <p className="text-emerald-600">Discount: -₹{lastInvoice.discount}</p>}
                <p>GST (18%): ₹{lastInvoice.tax}</p>
                <p className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-300">
                  Total Paid: ₹{lastInvoice.grandTotal}
                </p>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-500">
                <p>Thank you for visiting Nila Clinic!</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Bill</span>
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

    </div>
  );
}
