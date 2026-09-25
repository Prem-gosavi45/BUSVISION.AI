import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  ChevronDown, 
  Search, 
  SlidersHorizontal, 
  Bell, 
  Check, 
  AlertTriangle, 
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { AlertItem } from '../../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedPeriod,
  onPeriodChange,
  alerts,
  onSelectAlert,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const periods = [
    'Last 1 Hour',
    'Last 6 Hours',
    'Last 24 Hours',
    'Last 7 Days',
    'Last 30 Days'
  ];

  return (
    <header className="h-12 bg-white dark:bg-[#111827] border-b border-[#E1E5E8] dark:border-[#334155] px-4 flex items-center justify-between sticky top-0 z-20 w-full flex-shrink-0 transition-colors">
      {/* Left Filter & Search Cluster */}
      <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-4">
        {/* Location Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-[#F4F5F2] dark:bg-[#1E293B] border border-[#E1E5E8] dark:border-[#334155] rounded text-[11px] font-medium text-[#18212B] dark:text-[#F3F4F6] flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-[#2F6FED] dark:text-[#3B82F6]" />
          <span className="truncate">PMC Central · Zone 4</span>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded text-[11px] font-medium text-[#18212B] dark:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[#5F6872] dark:text-[#9CA3AF]" />
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-3 h-3 text-[#5F6872] dark:text-[#9CA3AF]" />
          </button>

          {showPeriodMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded shadow-lg z-30 py-1 text-[11px]">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    onPeriodChange(period);
                    setShowPeriodMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between text-[#18212B] dark:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] cursor-pointer"
                >
                  <span>{period}</span>
                  {selectedPeriod === period && <Check className="w-3.5 h-3.5 text-[#2F6FED] dark:text-[#3B82F6]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Omnibar Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#5F6872] dark:text-[#9CA3AF]">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Bus ID, Road, Alert ID..."
            className="w-full pl-8 pr-3 py-1 text-[11.5px] bg-[#F4F5F2]/60 dark:bg-[#1E293B]/60 border border-[#E1E5E8] dark:border-[#334155] rounded placeholder-[#5F6872] dark:placeholder-[#9CA3AF] text-[#18212B] dark:text-[#F3F4F6] focus:outline-none focus:border-[#2F6FED] focus:bg-white dark:focus:bg-[#111827] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] text-[#5F6872] hover:text-[#18212B] dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Quick Action */}
        <button
          type="button"
          onClick={() => setShowFiltersModal(!showFiltersModal)}
          className="p-1.5 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded text-[#18212B] dark:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
          title="Filter Telemetry Parameters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5F6872] dark:text-[#9CA3AF]" />
        </button>
      </div>

      {/* Right User & System Controls */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
        {/* Dark / Light Mode Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 text-[#5F6872] dark:text-[#9CA3AF] hover:text-[#18212B] dark:hover:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] rounded border border-transparent hover:border-[#E1E5E8] dark:hover:border-[#334155] transition-colors flex items-center justify-center cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>
        )}

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-[#5F6872] dark:text-[#9CA3AF] hover:text-[#18212B] dark:hover:text-[#F3F4F6] hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] rounded border border-transparent hover:border-[#E1E5E8] dark:hover:border-[#334155] transition-colors flex items-center justify-center cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#E5484D] rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded shadow-xl z-30 p-2">
              <div className="px-2.5 py-1.5 border-b border-[#E1E5E8] dark:border-[#334155] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#18212B] dark:text-white uppercase tracking-wider">
                  Active Alerts ({alerts.length})
                </span>
                <span className="text-[9.5px] text-[#16A36A] font-mono font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] animate-pulse" />
                  <span>LIVE FEED</span>
                </span>
              </div>
              <div className="divide-y divide-[#E1E5E8] dark:divide-[#334155] max-h-64 overflow-y-auto custom-scroll">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onSelectAlert?.(a);
                      setShowNotifications(false);
                    }}
                    className="p-2 hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#18212B] dark:text-[#F3F4F6] truncate max-w-[190px]">{a.title}</span>
                      <span className="font-mono text-[10px] text-[#5F6872] dark:text-[#9CA3AF]">{a.time}</span>
                    </div>
                    <div className="text-[10px] text-[#5F6872] dark:text-[#9CA3AF] mt-0.5 truncate">{a.location}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#E1E5E8] dark:border-[#334155]" />

        {/* Profile Group */}
        <div className="flex items-center space-x-2 pl-0.5">
          <div className="w-6 h-6 rounded bg-[#2F6FED]/10 dark:bg-[#3B82F6]/20 border border-[#2F6FED]/30 dark:border-[#3B82F6]/40 flex items-center justify-center text-[#2F6FED] dark:text-[#3B82F6] font-mono font-bold text-[10px] flex-shrink-0">
            OP
          </div>
          <div className="text-left hidden lg:block leading-tight">
            <div className="font-semibold text-[11px] text-[#18212B] dark:text-[#F3F4F6]">
              Operator PMC
            </div>
            <div className="text-[9.5px] font-mono text-[#5F6872] dark:text-[#9CA3AF]">
              CTRL-ROOM-01
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
