'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useIntersectionLoadMore } from '@/hooks/useInfiniteScroll';

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
  visibleCount: number;
  totalCount?: number;
  rootRef?: React.RefObject<HTMLElement | null>;
  itemLabel?: string;
}

export default function InfiniteScrollSentinel({
  hasMore,
  onLoadMore,
  isLoading = false,
  visibleCount,
  totalCount,
  rootRef,
  itemLabel = 'records',
}: InfiniteScrollSentinelProps) {
  const sentinelRef = useIntersectionLoadMore(onLoadMore, {
    enabled: hasMore && !isLoading,
    rootRef,
  });

  if (visibleCount === 0 && !isLoading) return null;

  return (
    <div
      ref={sentinelRef}
      className="py-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500 font-medium print:hidden"
    >
      {isLoading ? (
        <span className="inline-flex items-center space-x-2 text-emerald-700 font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading more {itemLabel}...</span>
        </span>
      ) : hasMore ? (
        <>
          <span>
            Showing <strong className="text-slate-800">{visibleCount}</strong>
            {typeof totalCount === 'number' ? ` of ${totalCount}` : ''} {itemLabel} • Scroll for more
          </span>
          <button
            type="button"
            onClick={onLoadMore}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
          >
            Load next 10
          </button>
        </>
      ) : (
        <span>
          Showing all <strong className="text-slate-700">{visibleCount}</strong> {itemLabel}
        </span>
      )}
    </div>
  );
}

