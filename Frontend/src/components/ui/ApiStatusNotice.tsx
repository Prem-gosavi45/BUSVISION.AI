import React from 'react';
import { RefreshCw, WifiOff, Activity, Loader2 } from 'lucide-react';

export type ApiConnectivityStatus = 'connected' | 'offline' | 'connecting';

interface ApiStatusNoticeProps {
  status?: ApiConnectivityStatus;
  isFallback?: boolean;
  error?: string | null;
  onRetry: () => void;
  isLoading?: boolean;
}

export default function ApiStatusNotice({
  status,
  error,
  onRetry,
  isLoading = false,
}: ApiStatusNoticeProps) {
  // Determine canonical status
  const currentStatus: ApiConnectivityStatus = isLoading
    ? 'connecting'
    : status || (error ? 'offline' : 'connected');

  if (currentStatus === 'connected') {
    return (
      <div className="bg-emerald-50/90 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded px-3 py-1.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 transition-colors">
        <div className="flex items-center space-x-2 min-w-0">
          <Activity className="w-3.5 h-3.5 text-[#16A36A] flex-shrink-0" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide">
            LIVE TELEMETRY
          </span>
          <span className="text-emerald-800/80 dark:text-emerald-400/80 text-[11px] truncate">
            · FastAPI telemetry stream synchronized with Supabase
          </span>
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="ml-3 flex items-center space-x-1 px-2 py-0.5 bg-white dark:bg-[#111827] border border-emerald-300 dark:border-emerald-800 rounded text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/50 dark:hover:bg-[#1E293B] transition-colors text-[10.5px] font-mono font-semibold flex-shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>SYNC</span>
        </button>
      </div>
    );
  }

  if (currentStatus === 'connecting') {
    return (
      <div className="bg-blue-50/90 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded px-3 py-1.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300 transition-colors">
        <div className="flex items-center space-x-2 min-w-0">
          <Loader2 className="w-3.5 h-3.5 text-[#2F6FED] dark:text-[#3B82F6] animate-spin flex-shrink-0" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide">
            CONNECTING...
          </span>
          <span className="text-blue-800/80 dark:text-blue-400/80 text-[11px] truncate">
            · Contacting BusVision FastAPI service
          </span>
        </div>

        <button
          type="button"
          disabled
          className="ml-3 flex items-center space-x-1 px-2 py-0.5 bg-white/70 dark:bg-[#111827]/70 border border-blue-300 dark:border-blue-800 rounded text-blue-900 dark:text-blue-200 text-[10.5px] font-mono font-semibold flex-shrink-0 opacity-60"
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>CONNECTING...</span>
        </button>
      </div>
    );
  }

  // Offline status
  return (
    <div className="bg-red-50/90 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded px-3 py-1.5 flex items-center justify-between text-xs text-red-900 dark:text-red-300 transition-colors">
      <div className="flex items-center space-x-2 min-w-0">
        <WifiOff className="w-3.5 h-3.5 text-[#E5484D] flex-shrink-0" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide">
          API OFFLINE
        </span>
        <span className="text-red-800/80 dark:text-red-400/80 text-[11px] truncate">
          · {error || 'Unable to connect to BusVision API. Telemetry feed unavailable.'}
        </span>
      </div>

      <button
        type="button"
        onClick={onRetry}
        disabled={isLoading}
        className="ml-3 flex items-center space-x-1 px-2 py-0.5 bg-white dark:bg-[#111827] border border-red-300 dark:border-red-800 rounded text-red-900 dark:text-red-200 hover:bg-red-100/50 dark:hover:bg-[#1E293B] transition-colors text-[10.5px] font-mono font-semibold flex-shrink-0 cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        <span>RECONNECT</span>
      </button>
    </div>
  );
}
