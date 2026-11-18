'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonLoaderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function ButtonLoader({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}: ButtonLoaderProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default ButtonLoader;

