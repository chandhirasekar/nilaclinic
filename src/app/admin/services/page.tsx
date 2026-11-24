'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Clock, Sparkles, Package, Tag, Building2, CheckCircle2, Edit2, X, Filter } from 'lucide-react';
import { IService, IProduct } from '@/types';
import { useClinic } from '@/context/ClinicContext';

export default function ServicesAndProductsMasterPage() {
  const { stores, selectedStore } = useClinic();
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [services, setServices] = useState<IService[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Service Modal State (Create)
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: 'Skin Care',
    duration: 30,
    price: 1500,
    gstPercent: 18,
    availableStores: ['ALL'],
    description: '',
  });

  // Service Modal State (Edit)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);

  // Product Modal State (Create)
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Skincare',
    sku: '',
    price: 650,
    gstPercent: 18,
    availableStores: ['ALL'],
  });

  // Product Modal State (Edit)
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        fetch(`/api/masters/services?storeCode=${selectedStore}`),
        fetch(`/api/masters/products?storeCode=${selectedStore}`),
      ]);
      const sData = await sRes.json();
      const pData = await pRes.json();
      if (sData.success) setServices(sData.data);
      if (pData.success) setProducts(pData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStore]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/masters/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });
      const data = await res.json();
      if (data.success) {
        setShowServiceModal(false);
        setNewService({ name: '', category: 'Skin Care', duration: 30, price: 1500, gstPercent: 18, availableStores: ['ALL'], description: '' });
        await loadData();
      } else {
        alert(data.message || 'Error adding treatment');
      }
    } catch (err) {
      alert('Error adding treatment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/masters/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditServiceModal(false);
        setEditingService(null);
        await loadData();
      } else {
        alert(data.message || 'Error updating treatment');
      }
    } catch (err) {
      alert('Failed to update treatment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/masters/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success) {
        setShowProductModal(false);
        setNewProduct({ name: '', category: 'Skincare', sku: '', price: 650, gstPercent: 18, availableStores: ['ALL'] });
        await loadData();
      } else {
        alert(data.message || 'Error adding product');
      }
    } catch (err) {
      alert('Error adding product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/masters/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditProductModal(false);
        setEditingProduct(null);
        await loadData();
      } else {
        alert(data.message || 'Error updating product');
      }
    } catch (err) {
      alert('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceCategories = ['All', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];
  const productCategories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || s.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Services & Products Masters (M2)</h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            FR-11 & FR-12: Treatments and retail products with GST %, durations, and store availability.
          </p>
        </div>

        {/* Action button */}
        {activeTab === 'services' ? (
          <button
            onClick={() => setShowServiceModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Treatment</span>
          </button>
        ) : (
          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveTab('services');
            setCategoryFilter('All');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'services'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Services & Treatments ({services.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('products');
            setCategoryFilter('All');
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'products'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Retail Products ({products.length})</span>
        </button>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'services'
                  ? 'Search treatments by name, description, or category...'
                  : 'Search products by name, SKU, or category...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Showing {activeTab === 'services' ? filteredServices.length : filteredProducts.length} of{' '}
            {activeTab === 'services' ? services.length : products.length}{' '}
            {activeTab === 'services' ? 'treatments' : 'products'}
          </div>
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Category:
          </span>
          {(activeTab === 'services' ? serviceCategories : productCategories).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? activeTab === 'services'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'services' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {svc.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-600 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {svc.duration} mins
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService({ ...svc });
                        setShowEditServiceModal(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-lg transition-all border border-slate-200 hover:border-emerald-300"
                      title="Edit Treatment Details"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{svc.name}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{svc.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900">₹{svc.price}</span>
                  <span className="text-xs font-medium text-slate-500 ml-1.5">+ {svc.gstPercent ?? 18}% GST</span>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {svc.availableStores.includes('ALL') ? 'All Stores' : svc.availableStores.join(', ')}
                </span>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
              No treatments found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md">
                    {prod.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    {prod.sku && <span className="text-xs font-mono font-medium text-slate-500">{prod.sku}</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct({ ...prod });
                        setShowEditProductModal(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs rounded-lg transition-all border border-slate-200 hover:border-sky-300"
                      title="Edit Product Details"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{prod.name}</h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900">₹{prod.price}</span>
                  <span className="text-xs font-medium text-slate-500 ml-1.5">+ {prod.gstPercent ?? 18}% GST</span>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  {prod.availableStores.includes('ALL') ? 'All Stores' : prod.availableStores.join(', ')}
                </span>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
              No products found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}

      {/* Service Modal (Create) */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-black text-slate-900 text-lg mb-1">Add Treatment Service (FR-11)</h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">Add treatment service details and pricing.</p>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laser Hair Reduction"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Skin Care">Skin Care</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Hair & Scalp">Hair & Scalp</option>
                    <option value="Laser Treatments">Laser Treatments</option>
                    <option value="Chemical Peels">Chemical Peels</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    required
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST %</label>
                  <input
                    type="number"
                    value={newService.gstPercent}
                    onChange={(e) => setNewService({ ...newService, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Clinical purpose and procedure description..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none h-16"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal (Edit & Update) */}
      {showEditServiceModal && editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Edit Treatment Service</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modify pricing, category, duration, and store access.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditServiceModal(false);
                  setEditingService(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="Skin Care">Skin Care</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Hair & Scalp">Hair & Scalp</option>
                    <option value="Laser Treatments">Laser Treatments</option>
                    <option value="Chemical Peels">Chemical Peels</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    required
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST %</label>
                  <input
                    type="number"
                    value={editingService.gstPercent ?? 18}
                    onChange={(e) => setEditingService({ ...editingService, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Availability</label>
                <select
                  value={editingService.availableStores?.includes('ALL') ? 'ALL' : editingService.availableStores?.[0] || 'ALL'}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      availableStores: e.target.value === 'ALL' ? ['ALL'] : [e.target.value],
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  <option value="ALL">All Stores</option>
                  {stores.map((st) => (
                    <option key={st.code} value={st.code}>
                      [{st.code}] {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Clinical purpose and procedure description..."
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none h-16"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditServiceModal(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Updating...' : 'Update & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal (Create) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <h3 className="font-black text-slate-900 text-lg mb-1">Add Retail Product (FR-12)</h3>
            <p className="text-sm text-slate-600 mb-4 font-medium">Add product catalog entry for retail sale.</p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Niacinamide Clarifying Serum"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Serums"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU (Optional)</label>
                  <input
                    type="text"
                    placeholder="SKU-XXX-01"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST %</label>
                  <input
                    type="number"
                    value={newProduct.gstPercent}
                    onChange={(e) => setNewProduct({ ...newProduct, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal (Edit & Update) */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Edit Retail Product</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modify price, SKU, category, and store availability.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST %</label>
                  <input
                    type="number"
                    value={editingProduct.gstPercent ?? 18}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gstPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Availability</label>
                <select
                  value={editingProduct.availableStores?.includes('ALL') ? 'ALL' : editingProduct.availableStores?.[0] || 'ALL'}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      availableStores: e.target.value === 'ALL' ? ['ALL'] : [e.target.value],
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                >
                  <option value="ALL">All Stores</option>
                  {stores.map((st) => (
                    <option key={st.code} value={st.code}>
                      [{st.code}] {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Updating...' : 'Update & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
