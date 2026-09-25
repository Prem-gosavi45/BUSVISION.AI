import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('7d');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#E1E5E8] dark:border-[#334155]">
        <div>
          <h2 className="text-base font-bold text-[#18212B] dark:text-[#f3f4f6]">
            Transit Analytics & Historical Trends
          </h2>
          <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] mt-0.5">
            Statistical correlation between pavement degradation, vehicle velocity, and fleet density
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#F4F5F2] dark:bg-[#131b28] p-0.5 rounded border border-[#E1E5E8] dark:border-[#334155] text-xs font-medium">
            <button
              onClick={() => setSelectedRange('24h')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedRange === '24h' ? 'bg-white dark:bg-[#1e293b] font-semibold shadow-xs' : 'text-[#5F6872]'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setSelectedRange('7d')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedRange === '7d' ? 'bg-white dark:bg-[#1e293b] font-semibold shadow-xs' : 'text-[#5F6872]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedRange('30d')}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedRange === '30d' ? 'bg-white dark:bg-[#1e293b] font-semibold shadow-xs' : 'text-[#5F6872]'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Chart Grid (Ready for API Ingestion) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reusable Chart Box 1: Pothole Frequency by Corridor */}
        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-xs text-[#18212B] dark:text-[#f3f4f6]">
                Pothole Defect Influx by Corridor
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5F6872] dark:text-[#9ca3af]">
              API Ready
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4 bg-[#F4F5F2] dark:bg-[#131b28] rounded border border-[#E1E5E8] dark:border-[#334155]">
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-[#E5484D] rounded-t-xs" style={{ height: '78%' }} />
              <span className="text-[10px] text-[#5F6872] truncate max-w-[50px]">FC Road</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-[#F59E0B] rounded-t-xs" style={{ height: '54%' }} />
              <span className="text-[10px] text-[#5F6872] truncate max-w-[50px]">JM Road</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-[#E5484D] rounded-t-xs" style={{ height: '92%' }} />
              <span className="text-[10px] text-[#5F6872] truncate max-w-[50px]">Paud Rd</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-[#16A36A] rounded-t-xs" style={{ height: '24%' }} />
              <span className="text-[10px] text-[#5F6872] truncate max-w-[50px]">Nagar Rd</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-[#F59E0B] rounded-t-xs" style={{ height: '46%' }} />
              <span className="text-[10px] text-[#5F6872] truncate max-w-[50px]">Swargate</span>
            </div>
          </div>
          <span className="text-[11px] text-[#5F6872] block">
            Corridor defect counts ready to stream from FastAPI <code className="text-primary font-mono">/api/analytics/corridors</code>.
          </span>
        </div>

        {/* Reusable Chart Box 2: Speed vs Density Regression */}
        <div className="bg-white dark:bg-[#1e293b] border border-[#E1E5E8] dark:border-[#334155] rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E1E5E8] dark:border-[#334155]">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-xs text-[#18212B] dark:text-[#f3f4f6]">
                Fleet Velocity Degradation Index
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#5F6872] dark:text-[#9ca3af]">
              API Ready
            </span>
          </div>

          <div className="h-48 flex items-center justify-center bg-[#F4F5F2] dark:bg-[#131b28] rounded border border-[#E1E5E8] dark:border-[#334155] p-4 text-center">
            <div className="space-y-2">
              <span className="text-2xl font-bold font-mono text-[#18212B] dark:text-[#f3f4f6]">
                -3.4 km/h
              </span>
              <p className="text-xs text-[#5F6872] dark:text-[#9ca3af] max-w-xs">
                Average transit velocity drag observed when road defect count exceeds 5 per linear kilometer.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#5F6872] block">
            Velocity degradation metrics ready to bind to <code className="text-primary font-mono">/api/analytics/velocity</code>.
          </span>
        </div>
      </div>
    </div>
  );
}
