import React from 'react';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 rounded-lg w-48" />
          <div className="h-4 bg-slate-100 rounded w-72" />
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-32" />
      </div>

      {/* KPI Cards */}
      <CardSkeleton count={4} />

      {/* Main Table / Grid */}
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}

