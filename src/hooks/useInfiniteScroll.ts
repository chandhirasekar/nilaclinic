'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionLoadMoreOptions {
  enabled: boolean;
  rootRef?: React.RefObject<HTMLElement | null>;
  rootMargin?: string;
}

/**
 * Triggers `onLoadMore` when the returned sentinel ref enters the viewport (or optional scroll container).
 */
export function useIntersectionLoadMore(
  onLoadMore: () => void,
  { enabled, rootRef, rootMargin = '200px' }: UseIntersectionLoadMoreOptions
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  useEffect(() => {
    if (!enabled) return;
    const target = sentinelRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          callbackRef.current();
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootRef, rootMargin]);

  return sentinelRef;
}

/**
 * Slices a client-side list to show `pageSize` (default 10) items initially and appends
 * `pageSize` more items each time `loadMore` fires on scroll.
 */
export function useInfiniteSlice<T>(
  items: T[],
  pageSize: number = 10,
  resetKey?: unknown
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, resetKey, items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(items.length, prev + pageSize));
  }, [items.length, pageSize]);

  return {
    visibleItems,
    visibleCount: visibleItems.length,
    totalCount: items.length,
    hasMore,
    loadMore,
  };
}

