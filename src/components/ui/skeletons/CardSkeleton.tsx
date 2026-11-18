'use client';

import React from 'react';

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="w-8 h-8 rounded-xl bg-slate-100" />
          </div>
          <div className="h-8 bg-slate-200/80 rounded-md w-32" />
          <div className="h-3 bg-slate-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export default CardSkeleton;

