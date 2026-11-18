'use client';

import { useState, useEffect } from 'react';

/**
 * useDebounce hook delays updating the debounced value until after `delay` ms
 * has elapsed since the last time the input value changed.
 * Ideal for POS client search and catalog filtering.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

