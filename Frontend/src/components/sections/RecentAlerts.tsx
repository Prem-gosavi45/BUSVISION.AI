import React from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Activity, 
  Car, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AlertItem } from '../../types';

interface RecentAlertsProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function RecentAlerts({
  alerts,
  onSelectAlert,
  isLoading = false,
  error = null,
  onRetry
}: RecentAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Pothole':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#E5484D] mt-0.5 flex-shrink-0" />;
      case 'Traffic':
        return <Activity className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />;
      case 'Road Incident':
        return <Car className="w-3.5 h-3.5 text-[#7C5CFC] mt-0.5 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-[#2F6FED] mt-0.5 flex-shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-50 dark:bg-red-950/40 text-[#E5484D] border-red-200 dark:border-red-900/50';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'Low':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A] border-emerald-200 dark:border-emerald-900/50';
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md flex flex-col flex-1 overflow-hidden transition-colors">
      {/* Header */}
      <div className="h-9 px-3.5 border-b border-[#E1E5E8] dark:border-[#334155] bg-[#FAFAFA] dark:bg-[#1E293B]/70 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <BellRing className="w-3.5 h-3.5 text-[#2F6FED] dark:text-[#3B82F6]" />
          <span className="text-[12px] font-semibold text-[#18212B] dark:text-[#F3F4F6] uppercase tracking-wide">
            Telemetry Alerts
          </span>
          <span className="text-[10px] font-mono text-[#5F6872] dark:text-[#9CA3AF] px-1.5 py-0.2 bg-[#EEF4FF] dark:bg-[#1E293B] rounded border border-[#C2C6D7]/60 dark:border-[#334155]">
            {alerts.length} ACTIVE
          </span>
        </div>
        <span className="font-mono text-[9.5px] text-[#5F6872] dark:text-[#9CA3AF] flex items-center space-x-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : error ? 'bg-red-400' : 'bg-[#16A36A]'}`} />
          <span>{isLoading ? 'SYNCING...' : error ? 'OFFLINE' : 'LIVE'}</span>
        </span>
      </div>

      {/* Alerts Stream List */}
      <div className="divide-y divide-[#E1E5E8] dark:divide-[#334155] overflow-y-auto max-h-[200px] custom-scroll flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-[11px] text-[#5F6872] dark:text-[#9CA3AF] flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2F6FED]" />
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-[11px] text-[#5F6872] dark:text-[#9CA3AF] flex flex-col items-center justify-center space-y-2">
            <span>Unable to load data</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD0D5] dark:border-[#475569] rounded text-[10px] font-mono hover:bg-[#F4F5F2] cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-[11px] text-[#5F6872] dark:text-[#9CA3AF]">
            No data available
          </div>
        ) : (
          alerts.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAlert?.(item)}
              className="p-2 hover:bg-[#F4F5F2] dark:hover:bg-[#1E293B] transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-start space-x-2 min-w-0">
                {getAlertIcon(item.type)}
                <div className="min-w-0">
                  <div className="text-[11.5px] font-semibold text-[#18212B] dark:text-[#F3F4F6] leading-tight truncate group-hover:text-[#2F6FED] dark:group-hover:text-[#3B82F6] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10.5px] text-[#5F6872] dark:text-[#9CA3AF] font-mono mt-0.5 truncate">
                    {item.location}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end space-y-0.5 flex-shrink-0 ml-2">
                <span className="font-mono text-[10px] text-[#5F6872] dark:text-[#9CA3AF]">
                  {item.time}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold border ${getSeverityBadge(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
