'use client';

import React from 'react';

export function PosGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-pulse">
      {/* Left Item Catalog (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Category Tabs Skeleton */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          <div className="h-8 bg-slate-200 rounded-xl w-24" />
          <div className="h-8 bg-slate-200 rounded-xl w-24" />
          <div className="h-8 bg-slate-200 rounded-xl w-24" />
        </div>

        {/* Search & Filter Bar */}
        <div className="h-11 bg-white border border-slate-200 rounded-2xl w-full" />

        {/* Item Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="h-3 bg-slate-100 rounded w-16" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-slate-200 rounded w-14" />
                <div className="w-6 h-6 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Cart Sidebar (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="h-5 bg-slate-200 rounded w-28" />
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
        <div className="space-y-3 py-4 border-y border-slate-100">
          <div className="h-12 bg-slate-50 rounded-xl w-full" />
          <div className="h-12 bg-slate-50 rounded-xl w-full" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <div className="h-3.5 bg-slate-100 rounded w-16" />
            <div className="h-3.5 bg-slate-200 rounded w-14" />
          </div>
          <div className="flex justify-between">
            <div className="h-3.5 bg-slate-100 rounded w-16" />
            <div className="h-3.5 bg-slate-200 rounded w-14" />
          </div>
          <div className="flex justify-between pt-2 border-t">
            <div className="h-5 bg-slate-200 rounded w-20" />
            <div className="h-5 bg-slate-200 rounded w-20" />
          </div>
        </div>
        <div className="h-12 bg-slate-200 rounded-2xl w-full mt-4" />
      </div>
    </div>
  );
}

export default PosGridSkeleton;

