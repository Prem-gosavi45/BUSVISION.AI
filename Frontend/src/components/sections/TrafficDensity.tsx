import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, RefreshCw } from 'lucide-react';
import { getTrafficDensity } from '../../api/traffic';
import { TrafficDensity, HourlyTrafficDensityPoint, DailyTrafficDensityPoint } from '../../types/traffic';

export default function TrafficDensitySection() {
  const [period, setPeriod] = useState<'last24' | '7d'>('last24');
  const [densityData, setDensityData] = useState<TrafficDensity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTooltip, setActiveTooltip] = useState<{
    visible: boolean;
    item?: DailyTrafficDensityPoint & { cx?: number; cy?: number };
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  const fetchDensity = async (targetPeriod: 'last24' | '7d') => {
    setLoading(true);
    setError(null);
    const apiPeriod = targetPeriod === 'last24' ? '24h' : '7d';
    const res = await getTrafficDensity(apiPeriod);
    if (res.error) {
      setError(res.error);
      setDensityData(null);
    } else {
      setDensityData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDensity(period);
  }, [period]);

  const hasData = Boolean(densityData && densityData.data && densityData.data.length > 0);

  // Safe data extraction from real API response only
  const highPercent = densityData?.high_percentage;
  const medPercent = densityData?.medium_percentage;
  const lowPercent = densityData?.low_percentage;
  const avgSpeed = densityData?.average_speed_kmh;
  const speedChange = densityData?.speed_change_kmh;

  // 24h hourly points from real backend data
  const hourlyPoints: HourlyTrafficDensityPoint[] = (
    period === 'last24' && hasData ? (densityData!.data as HourlyTrafficDensityPoint[]) : []
  );

  // 7d daily points from real backend data
  const dailyPoints: DailyTrafficDensityPoint[] = (
    period === '7d' && hasData ? (densityData!.data as DailyTrafficDensityPoint[]) : []
  );

  // Map 7d points to SVG coordinates safely
  const mappedDailyPoints = dailyPoints.map((item, idx) => {
    const total = dailyPoints.length;
    const cx = total > 1 ? Math.round(35 + (idx * (298 - 35)) / (total - 1)) : 166;
    const count = item.average_vehicle_count ?? 0;
    // Normalized Y coordinate between 15 (high: 60v) and 75 (low: 10v)
    const cy = Math.round(Math.max(15, Math.min(75, 75 - ((count - 10) / 50) * 60)));
    return {
      ...item,
      cx,
      cy
    };
  });

  const polylinePoints = mappedDailyPoints.map(p => `${p.cx},${p.cy}`).join(' ');
  const polygonPoints = mappedDailyPoints.length > 0
    ? `35,75 ${polylinePoints} ${mappedDailyPoints[mappedDailyPoints.length - 1].cx},75`
    : '35,75 298,75';

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E1E5E8] dark:border-[#334155] rounded-md p-3 flex flex-col overflow-hidden relative transition-colors">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#E1E5E8] dark:border-[#334155] pb-2 flex-shrink-0 flex-wrap gap-1.5">
        <div className="flex items-center space-x-2">
          <LineChart className="w-3.5 h-3.5 text-[#2F6FED] dark:text-[#3B82F6]" />
          <span className="text-[12px] font-semibold text-[#18212B] dark:text-[#F3F4F6] uppercase tracking-wide">
            Traffic Density
          </span>
        </div>

        {/* Period Toggle Pill */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#F4F5F2] dark:bg-[#1E293B] p-0.5 rounded border border-[#E1E5E8] dark:border-[#334155] text-[10px] font-mono">
            <button
              type="button"
              onClick={() => setPeriod('last24')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                period === 'last24'
                  ? 'bg-white dark:bg-[#111827] text-[#18212B] dark:text-[#F3F4F6] font-semibold'
                  : 'text-[#5F6872] dark:text-[#9CA3AF] hover:text-[#18212B] dark:hover:text-[#F3F4F6]'
              }`}
            >
              24H
            </button>
            <button
              type="button"
              onClick={() => setPeriod('7d')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                period === '7d'
                  ? 'bg-white dark:bg-[#111827] text-[#18212B] dark:text-[#F3F4F6] font-semibold'
                  : 'text-[#5F6872] dark:text-[#9CA3AF] hover:text-[#18212B] dark:hover:text-[#F3F4F6]'
              }`}
            >
              7D
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-8 text-center text-[11px] text-[#5F6872] dark:text-[#9CA3AF] flex flex-col items-center justify-center space-y-2 min-h-[160px]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#2F6FED]" />
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-[11px] text-[#5F6872] dark:text-[#9CA3AF] flex flex-col items-center justify-center space-y-2 min-h-[160px]">
          <span>Unable to load data</span>
          <button
            type="button"
            onClick={() => fetchDensity(period)}
            className="px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD0D5] dark:border-[#475569] rounded text-[10px] font-mono hover:bg-[#F4F5F2] cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : !hasData ? (
        <div className="p-8 text-center text-[11px] text-[#5F6872] dark:text-[#9CA3AF] flex flex-col items-center justify-center space-y-1 min-h-[160px]">
          <span className="font-semibold text-[#18212B] dark:text-[#F3F4F6]">No traffic density data available</span>
          <span className="text-[10px] text-[#5F6872] dark:text-[#9CA3AF]">
            GET /api/traffic/density?period={period === 'last24' ? '24h' : '7d'} returned no records.
          </span>
        </div>
      ) : (
        <>
          {/* VIEW 1: LAST 24 HOURS VIEW */}
          {period === 'last24' && (
            <div className="flex flex-col">
              {/* Top: Segmented Proportional Density */}
              {(highPercent != null || medPercent != null || lowPercent != null) && (
                <div className="mt-2.5 flex-shrink-0">
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="inline-flex items-center space-x-1 text-[#18212B] dark:text-[#f3f4f6]">
                      <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
                      <span>High <strong className="text-[#E5484D]">{highPercent ?? 0}%</strong></span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[#18212B] dark:text-[#f3f4f6]">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      <span>Medium <strong className="text-[#B45309] dark:text-amber-400">{medPercent ?? 0}%</strong></span>
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[#18212B] dark:text-[#f3f4f6]">
                      <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
                      <span>Low <strong className="text-[#16A36A]">{lowPercent ?? 0}%</strong></span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full overflow-hidden flex bg-[#E1E5E8] dark:bg-[#334155]">
                    <div className="bg-[#E5484D] h-full" style={{ width: `${highPercent ?? 0}%` }} />
                    <div className="bg-[#F59E0B] h-full" style={{ width: `${medPercent ?? 0}%` }} />
                    <div className="bg-[#16A36A] h-full" style={{ width: `${lowPercent ?? 0}%` }} />
                  </div>
                </div>
              )}

              {/* Middle: Contained Mini Density Chart */}
              <div className="mt-2.5 overflow-hidden bg-[#F4F5F2] dark:bg-[#0B0F17] rounded border border-[#E1E5E8] dark:border-[#334155] p-2 flex flex-col justify-between h-[115px]">
                <div className="flex items-center justify-between text-[9.5px] text-[#5F6872] dark:text-[#9CA3AF] font-mono">
                  <span>{hourlyPoints[0]?.hour || '00:00'}</span>
                  <span>{hourlyPoints[Math.floor(hourlyPoints.length / 2)]?.hour || '12:00'}</span>
                  <span>{hourlyPoints[hourlyPoints.length - 1]?.hour || '23:00'}</span>
                </div>

                {/* SVG / CSS Mini Bar Histogram */}
                <div className="h-[68px] w-full flex items-end justify-between gap-1 pt-1">
                  {hourlyPoints.map((bar, idx) => {
                    let barColor = 'bg-[#CBD0D5] dark:bg-[#334155]';
                    const densityVal = bar.density ?? 0;
                    if (densityVal >= 80) barColor = 'bg-[#E5484D]';
                    else if (densityVal >= 50) barColor = 'bg-[#F59E0B]';
                    else if (densityVal > 0) barColor = 'bg-[#16A36A]';

                    return (
                      <div
                        key={idx}
                        className={`w-full ${barColor} rounded-none transition-opacity hover:opacity-80 cursor-pointer`}
                        style={{ height: `${Math.max(6, Math.min(100, densityVal))}%` }}
                        title={`${bar.hour} - ${densityVal}% Density ${bar.label ? `(${bar.label})` : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: 7 DAYS HISTORICAL VIEW */}
          {period === '7d' && (
            <div className="flex flex-col">
              {/* 7D Mini Header Status */}
              <div className="mt-2 flex items-center justify-between text-[11px] font-mono flex-shrink-0">
                <div className="flex items-center space-x-1.5 text-[#18212B] dark:text-[#f3f4f6]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0055ce] dark:text-blue-400" />
                  <span className="font-semibold">Corridor 7-Day Trend</span>
                </div>
                <span className="text-[10px] text-[#5F6872] dark:text-[#9ca3af] bg-[#EEF4FF] dark:bg-blue-900/20 px-1.5 py-0.5 rounded border border-[#C2C6D7]/50 dark:border-blue-800/40">
                  GET /api/traffic/density
                </span>
              </div>

              {/* SVG Line Chart */}
              <div className="mt-2 overflow-hidden bg-[#F4F5F2] dark:bg-[#131b28] rounded border border-[#E1E5E8] dark:border-[#334155] p-2 relative h-[135px] flex flex-col justify-between">
                {/* Dynamic Hover Tooltip */}
                {activeTooltip.visible && activeTooltip.item && (
                  <div 
                    className="absolute z-20 pointer-events-none bg-[#18212B] dark:bg-[#0f172a] border border-[#334155] text-white text-[10px] rounded px-2 py-1 shadow-md font-mono"
                    style={{
                      top: '8px',
                      left: activeTooltip.x > 180 ? 'auto' : '12px',
                      right: activeTooltip.x > 180 ? '12px' : 'auto'
                    }}
                  >
                    <div className="font-bold text-white">
                      {activeTooltip.item.day} ({activeTooltip.item.date})
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`px-1 py-0.2 text-[9px] font-semibold rounded ${
                        activeTooltip.item.traffic_level === 'HIGH' 
                          ? 'bg-red-500/20 text-red-300' 
                          : activeTooltip.item.traffic_level === 'MEDIUM' 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {activeTooltip.item.traffic_level}
                      </span>
                      <span className="text-slate-200">
                        {activeTooltip.item.average_vehicle_count} veh/min
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {activeTooltip.item.event_count} events detected
                    </div>
                  </div>
                )}

                {/* SVG Line Chart Canvas */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F6FED" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2F6FED" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gridlines */}
                  <line x1="26" y1="15" x2="310" y2="15" strokeDasharray="2,2" strokeWidth="0.8" className="stroke-[#E1E5E8] dark:stroke-[#334155]" />
                  <line x1="26" y1="45" x2="310" y2="45" strokeDasharray="2,2" strokeWidth="0.8" className="stroke-[#E1E5E8] dark:stroke-[#334155]" />
                  <line x1="26" y1="75" x2="310" y2="75" strokeWidth="0.8" className="stroke-[#E1E5E8] dark:stroke-[#334155]" />

                  {/* Area under curve */}
                  <polygon
                    fill="url(#trafficGradient)"
                    points={polygonPoints}
                  />

                  {/* Metric Line */}
                  <polyline
                    fill="none"
                    stroke="#2F6FED"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />

                  {/* Data Point Nodes */}
                  {mappedDailyPoints.map((item, idx) => {
                    let dotColor = '#16A36A';
                    if (item.traffic_level === 'HIGH') dotColor = '#E5484D';
                    else if (item.traffic_level === 'MEDIUM') dotColor = '#F59E0B';

                    return (
                      <circle
                        key={idx}
                        cx={item.cx}
                        cy={item.cy}
                        r={item.traffic_level === 'HIGH' ? 4 : 3}
                        fill={dotColor}
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                        className="cursor-pointer hover:scale-125 transition-transform"
                        onMouseEnter={() => {
                          setActiveTooltip({
                            visible: true,
                            item,
                            x: item.cx,
                            y: item.cy
                          });
                        }}
                        onMouseLeave={() => {
                          setActiveTooltip({ visible: false, x: 0, y: 0 });
                        }}
                      />
                    );
                  })}

                  {/* X-Axis Labels */}
                  {mappedDailyPoints.map((item, idx) => (
                    <text
                      key={idx}
                      x={item.cx}
                      y="92"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="600"
                      fontFamily="Inter"
                      className="fill-[#5F6872] dark:fill-[#9CA3AF]"
                    >
                      {item.day}
                    </text>
                  ))}
                </svg>
              </div>

              {/* 7D Footnote */}
              {(densityData?.corridor_average_vehicles_per_min != null || densityData?.total_events != null) && (
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[#5F6872] dark:text-[#9CA3AF]">
                  {densityData?.corridor_average_vehicles_per_min != null && (
                    <span>
                      7D Avg: <strong className="text-[#18212B] dark:text-[#F3F4F6]">
                        {densityData.corridor_average_vehicles_per_min} veh/min
                      </strong>
                    </span>
                  )}
                  {densityData?.total_events != null && (
                    <span>
                      Total: <strong className="text-[#2F6FED] dark:text-[#3B82F6]">
                        {densityData.total_events} events
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Footer Inside Card: Avg Corridor Speed */}
      <div className="mt-2 pt-2 border-t border-[#E1E5E8] dark:border-[#334155] flex items-center justify-between text-[11px] flex-shrink-0">
        <span className="text-[#5F6872] dark:text-[#9CA3AF] uppercase font-semibold text-[9.5px]">Avg Corridor Speed:</span>
        <span className="font-mono text-[12px] font-bold text-[#18212B] dark:text-[#F3F4F6] tabular-nums">
          {avgSpeed != null ? `${avgSpeed} km/h` : '--'}
          {speedChange != null && (
            <span className="font-normal text-[10.5px] text-[#16A36A] ml-1">
              ({speedChange > 0 ? `+${speedChange}` : speedChange} km/h)
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
