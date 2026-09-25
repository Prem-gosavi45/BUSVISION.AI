import React, { useState } from 'react';
import { Sliders, Server, Shield, Moon, Sun, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../api/client';
import { getBuses } from '../api/buses';

interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function SettingsPage({ isDark, onToggleTheme }: SettingsPageProps) {
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'online' | 'offline'>('idle');
  const [pingMessage, setPingMessage] = useState<string>('');

  const testApiConnection = async () => {
    setPingStatus('testing');
    const start = performance.now();
    const res = await getBuses();
    const duration = Math.round(performance.now() - start);

    if (res.error || res.isFallback) {
      setPingStatus('offline');
      setPingMessage(`Connection failed (${duration}ms). Using local cached telemetry.`);
    } else {
      setPingStatus('online');
      setPingMessage(`FastAPI responded in ${duration}ms (HTTP 200 OK).`);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="pb-1 border-b border-[#E1E5E8] dark:border-[#334155]">
        <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
          System Settings & Telemetry Architecture
        </h2>
        <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
          Configure API endpoints, security isolation, and UI interface preferences
        </p>
      </div>

      {/* Backend API Configuration */}
      <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
          <Server className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-[#18212B] dark:text-[#f3f4f6]">
            FastAPI Backend Service Layer
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#18212B] dark:text-[#f3f4f6] mb-1">
              Centralized API Base URL (VITE_API_BASE_URL)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={API_BASE_URL}
                className="flex-1 font-mono bg-[#F4F5F2] dark:bg-[#131b28] border border-[#E1E5E8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#18212B] dark:text-[#f3f4f6] select-all"
              />
              <button
                type="button"
                onClick={testApiConnection}
                disabled={pingStatus === 'testing'}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white dark:bg-[#253347] border border-[#CBD0D5] dark:border-[#475569] rounded-md text-xs font-semibold text-[#18212B] dark:text-[#f3f4f6] hover:bg-[#F4F5F2] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>
          </div>

          {pingStatus !== 'idle' && (
            <div className={`p-2.5 rounded border text-xs font-mono flex items-center space-x-2 ${
              pingStatus === 'online'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                : pingStatus === 'offline'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-300'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-800'
            }`}>
              {pingStatus === 'online' && <CheckCircle className="w-4 h-4 text-[#16A36A]" />}
              {pingStatus === 'offline' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              <span>{pingMessage}</span>
            </div>
          )}

          <div className="p-3 bg-[#F4F5F2] dark:bg-[#131b28] rounded border border-[#E1E5E8] dark:border-[#334155] space-y-1">
            <span className="font-semibold text-[#18212B] dark:text-[#f3f4f6] block">
              Architecture & Security Compliance:
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-[#5F6872] dark:text-[#9ca3af]">
              <li>Frontend communicates exclusively with FastAPI REST endpoints.</li>
              <li>Supabase credentials and service-role keys are strictly kept server-side.</li>
              <li>Images and detection crops are streamed via signed Supabase Storage URLs.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Visual Interface & Theme */}
      <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-[#18212B] dark:text-[#f3f4f6]">
            Appearance & UI Preferences
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-[#18212B] dark:text-[#f3f4f6] block">
              Application Theme Mode
            </span>
            <span className="text-[#5F6872] dark:text-[#9ca3af]">
              Currently using {isDark ? 'Dark Mode (PMC Ops Night)' : 'Light Mode (PMC Standard Day)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border border-[#CBD0D5] dark:border-[#475569] bg-[#F4F5F2] dark:bg-[#131b28] text-xs font-semibold text-[#18212B] dark:text-[#f3f4f6] cursor-pointer"
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
