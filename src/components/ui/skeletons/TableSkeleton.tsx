'use client';

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 6, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-pulse">
      {showHeader && (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-md w-36" />
          <div className="h-8 bg-slate-100 rounded-xl w-48" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/70 border-b border-slate-100">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3.5">
                  <div className="h-3.5 bg-slate-200/80 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="hover:bg-slate-50/50">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="p-3.5">
                    <div
                      className="h-3.5 bg-slate-100 rounded"
                      style={{ width: `${Math.max(40, (c * 17 + r * 23) % 90 + 30)}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableSkeleton;

