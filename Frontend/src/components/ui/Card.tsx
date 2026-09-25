import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export default function Card({ children, className = '', header, footer }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg shadow-[0_1px_3px_rgba(24,33,43,0.04)] transition-colors ${className}`}
    >
      {header && (
        <div className="h-10 px-3.5 border-b border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1e293b]/80 flex items-center justify-between flex-shrink-0">
          {header}
        </div>
      )}
      {children}
      {footer && (
        <div className="border-t border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1e293b]/80 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
