'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { IInventory } from '@/types';

export default function InventoryPage() {
  const [items, setItems] = useState<IInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Hair Care',
    stockQty: 10,
    minThreshold: 5,
    unitPrice: 1200,
    supplier: 'L\'Oréal Professional',
  });

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        if (data.success) setItems(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.success) {
        setItems([...items, data.data]);
        setShowModal(false);
        setNewItem({ name: '', category: 'Hair Care', stockQty: 10, minThreshold: 5, unitPrice: 1200, supplier: 'L\'Oréal Professional' });
      }
    } catch (err) {
      alert('Error creating inventory item');
    }
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Product Stock</h1>
          <p className="text-sm text-slate-500">Track professional products, stock levels, suppliers, and reorder warnings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stock item name or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">In Stock Qty</th>
                <th className="px-6 py-3.5">Unit Price</th>
                <th className="px-6 py-3.5">Supplier</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.stockQty <= item.minThreshold;
                return (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.category}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{item.stockQty} Units</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{item.unitPrice}</td>
                    <td className="px-6 py-4 text-slate-500">{item.supplier}</td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
                          Low Stock (Reorder)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Sufficient
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Product to Inventory</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olaplex No. 3 Hair Perfector"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">In Stock Qty *</label>
                  <input
                    type="number"
                    value={newItem.stockQty}
                    onChange={(e) => setNewItem({ ...newItem, stockQty: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="Supplier or distributor"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
