import React from 'react';
import {
  Building2,
  LayoutDashboard,
  Map,
  Bus,
  Wrench,
  TrafficCone,
  AlertTriangle,
  LineChart,
  ClipboardList,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function Sidebar({
  currentTab,
  onTabChange,
  isDark,
  onToggleTheme,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'live-map', path: '/live-map', label: 'Live Map', icon: Map, badge: null },
    { id: 'fleet', path: '/fleet', label: 'Fleet Monitoring', icon: Bus, badge: null },
    { id: 'road-infrastructure', path: '/road-infrastructure', label: 'Road Infrastructure', icon: Wrench, badge: null },
    { id: 'traffic', path: '/traffic', label: 'Traffic Intelligence', icon: TrafficCone, badge: null },
    { id: 'alerts', path: '/alerts', label: 'Alerts', icon: AlertTriangle, badge: '12' },
    { id: 'analytics', path: '/analytics', label: 'Analytics', icon: LineChart, badge: null },
    { id: 'reports', path: '/reports', label: 'Reports', icon: ClipboardList, badge: null },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-[230px] flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-[#111827] border-r border-[#E1E5E8] dark:border-[#334155] flex flex-col justify-between z-30 select-none transition-colors">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="px-3.5 py-3 border-b border-[#E1E5E8] dark:border-[#334155] bg-white dark:bg-[#111827]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-[#2F6FED]/10 dark:bg-[#3B82F6]/20 border border-[#2F6FED]/30 dark:border-[#3B82F6]/40 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-[#2F6FED] dark:text-[#3B82F6]" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] tracking-tight text-[#18212B] dark:text-[#F3F4F6] uppercase leading-tight font-bold truncate">
                BusVision AI
              </div>
              <div className="text-[9px] tracking-widest text-[#5F6872] dark:text-[#9CA3AF] uppercase font-semibold">
                Urban Intelligence
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#2F6FED] dark:text-[#3B82F6] px-1.5 py-0.5 bg-[#EEF4FF] dark:bg-[#1E293B] rounded border border-[#C2C6D7]/60 dark:border-[#334155]">
              PMC NODE-01
            </span>
            <span className="text-[10px] font-mono text-[#16A36A] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className="py-2 space-y-0.5 px-2 overflow-y-auto custom-scroll flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF4FF] dark:bg-[#1E293B] text-[#2F6FED] dark:text-[#3B82F6] border-l-2 border-[#2F6FED] dark:border-[#3B82F6] font-semibold'
                    : 'text-[#5F6872] dark:text-[#9CA3AF] hover:bg-[#F4F5F2] dark:hover:bg-[#1F2937] hover:text-[#18212B] dark:hover:text-[#F3F4F6] font-normal'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#2F6FED] dark:text-[#3B82F6]' : 'text-[#5F6872] dark:text-[#9CA3AF]'}`} />
                  <span className="truncate">
                    {item.label}
                  </span>
                </div>

                {item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#E5484D] text-white rounded font-mono font-bold leading-tight">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FED] dark:bg-[#3B82F6]" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Compact Theme Toggle */}
        {onToggleTheme && (
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] text-[#5F6872] dark:text-[#9CA3AF] hover:bg-[#F4F5F2] dark:hover:bg-[#1F2937] hover:text-[#18212B] dark:hover:text-[#F3F4F6] border border-[#E1E5E8]/60 dark:border-[#334155]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className="font-medium">{isDark ? 'Light Interface' : 'Dark Interface'}</span>
              </div>
              <span className="font-mono text-[9px] uppercase px-1 py-0.2 bg-[#F4F5F2] dark:bg-[#1E293B] rounded">
                {isDark ? 'DARK' : 'LIGHT'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#E1E5E8] dark:border-[#334155] bg-[#F4F5F2]/60 dark:bg-[#0B0F17]/80">
        <div className="flex items-center justify-between text-[10.5px] font-mono text-[#5F6872] dark:text-[#9CA3AF]">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
            <span className="font-medium text-[#18212B] dark:text-[#F3F4F6]">System Online</span>
          </span>
          <span>v2.4.1</span>
        </div>
        <div className="text-[10px] text-[#5F6872] dark:text-[#9CA3AF] font-mono mt-1 flex items-center justify-between">
          <span>Hub-04 Pune Metro</span>
          <span className="text-[#16A36A]">STABLE</span>
        </div>
      </div>
    </aside>
  );
}
