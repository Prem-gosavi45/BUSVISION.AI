import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function Loader({ size = 'md', label }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-4">
      <div
        className={`${sizeClasses[size]} border-[#CBD0D5] border-t-[#0055ce] dark:border-[#334155] dark:border-t-[#3b82f6] rounded-full animate-spin`}
      />
      {label && (
        <span className="text-xs text-[#5F6872] dark:text-[#9ca3af] font-medium font-sans">
          {label}
        </span>
      )}
    </div>
  );
}
