import React from 'react';
import { ShieldCheck, Activity, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-8 px-5 bg-white dark:bg-[#111827] border-t border-[#E1E5E8] dark:border-[#334155] flex items-center justify-between text-[10.5px] font-mono text-[#5F6872] dark:text-[#9CA3AF] transition-colors flex-shrink-0">
      <div className="flex items-center space-x-2.5">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
          <span className="font-sans font-medium text-[#18212B] dark:text-[#F3F4F6]">PMC SMART TRANSIT NETWORK</span>
        </span>
        <span className="hidden sm:inline text-[#E1E5E8] dark:text-[#334155]">|</span>
        <span className="hidden sm:inline">EDGE MODEL: YOLOv11-URBAN</span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="flex items-center space-x-1">
          <Activity className="w-3 h-3 text-[#2F6FED] dark:text-[#3B82F6]" />
          <span>NODE-01: 14MS</span>
        </span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">PUNE MUNICIPAL CORPORATION</span>
      </div>
    </footer>
  );
}
